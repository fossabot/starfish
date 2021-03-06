import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'
import type { Planet } from '../../game/classes/Planet/Planet'

interface DBPlanetDoc
  extends BasePlanetData,
    BasePlanetData,
    Document {
  id: string
}

const planetSchemaFields: Record<
  | keyof BasePlanetData
  | keyof BaseBasicPlanetData
  | keyof BaseMiningPlanetData
  | keyof BaseCometData,
  any
> = {
  planetType: String,
  id: String,
  location: [{ type: Number, required: true }],
  color: String,
  name: { type: String, required: true },
  radius: Number,
  mass: Number,
  landingRadiusMultiplier: Number,
  creatures: [String],

  level: Number,
  xp: Number,
  baseLevel: Number,

  passives: [
    {
      id: String,
      intensity: Number,
      data: Schema.Types.Mixed,
    },
  ],
  pacifist: Boolean,
  stats: [{ stat: String, amount: Number }],

  // mining
  mine: [
    {
      id: { type: String },
      payoutAmount: Number,
      mineRequirement: Number,
      mineCurrent: Number,
      maxMineable: Number,
    },
  ],

  // comet
  velocity: [Number, Number],
  trail: [[Number, Number]],

  // basic
  leanings: [
    {
      type: { type: String },
      never: Boolean,
      propensity: Number,
    },
  ],
  guildId: String,

  allegiances: [{ guildId: String, level: Number }],
  vendor: {
    cargo: [
      {
        id: String,
        buyMultiplier: Number,
        sellMultiplier: Number,
      },
    ],
    chassis: [
      {
        id: String,
        buyMultiplier: Number,
        sellMultiplier: Number,
      },
    ],
    items: [
      {
        type: { type: String },
        id: String,
        buyMultiplier: Number,
        sellMultiplier: Number,
      },
    ],
    passives: [
      {
        id: String,
        buyMultiplier: Number,
        intensity: Number,
      },
    ],
    shipCosmetics: [
      {
        tagline: String,
        headerBackground: { id: String, url: String },
        priceMultiplier: Number,
      },
    ],
    crewCosmetics: [
      {
        tagline: String,
        background: { id: String, url: String },
        priceMultiplier: Number,
      },
    ],
    repairCostMultiplier: Number,
  },

  bank: Boolean,
  defense: Number,

  maxContracts: Number,
  contracts: [
    {
      id: String,
      reward: {
        credits: Number,
        shipCosmeticCurrency: Number,
        crewCosmeticCurrency: Number,
      },
      status: String,
      timeAllowed: Number,
      targetId: String,
      targetName: String,
      targetGuildId: String,
      difficulty: Number,
      claimCost: {
        credits: Number,
        shipCosmeticCurrency: Number,
        crewCosmeticCurrency: Number,
      },
      claimableExpiresAt: Number,
    },
  ],

  hitList: [String],
}
const planetSchema = new Schema(planetSchemaFields)
const DBPlanet = model<DBPlanetDoc>(
  `DBPlanet`,
  planetSchema,
)

export async function addOrUpdateInDb(
  data: Planet,
): Promise<BasePlanetData> {
  const stub = data.stubify() as PlanetStub
  const toSave = (new DBPlanet(stub) as any)._doc
  delete toSave._id
  const dbObject: DBPlanetDoc | null =
    await DBPlanet.findOneAndUpdate(
      { id: data.id },
      toSave,
      {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
      },
    )
  return dbObject as any
}

export async function removeFromDb(id: string) {
  const res = await DBPlanet.deleteMany({ id })
  // c.log(`Deleted planet`, id, res)
}

export async function wipe() {
  const res = await DBPlanet.deleteMany({})
  c.log(`Wiped planet DB`, res)
}

export async function getAllConstructible(): Promise<
  BasePlanetData[]
> {
  const docs: any = (await DBPlanet.find({})).map((d) =>
    d.toObject(),
  )
  // clearExtraneousMongooseIdEntry(docs)
  return docs
}

function clearExtraneousMongooseIdEntry(obj: any) {
  if (!obj) return
  if (obj._id) delete obj._id
  if (typeof obj !== `object`) return
  if (Array.isArray(obj)) {
    obj.forEach(clearExtraneousMongooseIdEntry)
    return
  }
  Object.keys(obj).forEach((key) =>
    clearExtraneousMongooseIdEntry(obj[key]),
  )
}
