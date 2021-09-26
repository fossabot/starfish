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
  | keyof BaseMiningPlanetData,
  any
> = {
  planetType: String,
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
    },
  ],

  // basic
  leanings: [
    {
      type: { type: String },
      never: Boolean,
      propensity: Number,
    },
  ],
  factionId: String,
  homeworld: { id: String },
  allegiances: [{ faction: { id: String }, level: Number }],
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
    actives: [
      {
        id: String,
        buyMultiplier: Number,
        sellMultiplier: Number,
      },
    ],
    passives: [{ id: String, buyMultiplier: Number }],
    repairCostMultiplier: Number,
  },
}
const planetSchema = new Schema(planetSchemaFields)
const DBPlanet = model<DBPlanetDoc>(
  `DBPlanet`,
  planetSchema,
)

export async function addOrUpdateInDb(
  data: Planet,
): Promise<BasePlanetData> {
  const stub = data.stubify()
  const toSave = (new DBPlanet(stub) as any)._doc
  delete toSave._id
  const dbObject: DBPlanetDoc | null =
    await DBPlanet.findOneAndUpdate(
      { name: data.name },
      toSave,
      {
        upsert: true,
        new: true,
        lean: true,
        setDefaultsOnInsert: true,
      },
    )
  return dbObject
}

export async function removeFromDb(name: string) {
  const res = await DBPlanet.deleteMany({ name })
  c.log(`Deleted planet`, name, res)
}

export async function wipe() {
  const res = await DBPlanet.deleteMany({})
  c.log(`Wiped planet DB`, res)
}

export async function getAllConstructible(): Promise<
  BasePlanetData[]
> {
  const docs = (await DBPlanet.find({})).map((d) =>
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
