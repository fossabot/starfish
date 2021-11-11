import { Schema, model, Document, Types } from 'mongoose'
import c from '../../../../common/dist'
import type { Ship } from '../../game/classes/Ship/Ship'

interface DBShipDoc
  extends BaseShipData,
    BaseHumanShipData,
    Document {
  id: string
}

const shipSchemaFields: Record<
  keyof BaseHumanShipData | keyof BaseAIShipData,
  any
> = {
  id: { type: String, required: true },
  guildIcon: { type: String },
  guildName: { type: String },
  guildId: { type: String },
  spawnedAt: { type: Number },
  location: [{ type: Number, required: true }],
  velocity: [{ type: Number, required: true }],
  name: { type: String, required: true },
  loadout: String,
  chassis: { id: { type: String, required: true } },
  items: [
    {
      type: { type: String, required: true },
      id: { type: String, required: true },
      repair: Number,
      cooldownRemaining: Number,
    },
  ],
  previousLocations: [[Number, Number]],

  // ----- human
  log: [
    {
      content: Schema.Types.Mixed,
      time: Number,
      level: String,
      icon: String,
    },
  ],
  seenPlanets: [{ name: String, id: String }],
  seenLandmarks: [{ type: { type: String }, id: String }],
  seenCrewMembers: [String],
  tutorial: {
    step: Number,
    baseLocation: [Number, Number],
  },
  tagline: String,
  headerBackground: String,
  boughtHeaderBackgrounds: [{ id: String, url: String }],
  boughtTaglines: [String],
  achievements: [String],
  orderReactions: [
    { id: { type: String }, reaction: String },
  ],
  captain: String,
  logAlertLevel: String,
  stats: [{ stat: String, amount: Number }],
  banked: [
    { id: String, amount: Number, timestamp: Number },
  ],
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
      timeAccepted: Number,
      fromPlanetId: String,
      targetId: String,
      targetName: String,
      targetGuildId: String,
      difficulty: Number,
      lastSeenLocation: [Number],
      claimCost: {
        credits: Number,
        shipCosmeticCurrency: Number,
        crewCosmeticCurrency: Number,
      },
    },
  ],
  crewMembers: [
    {
      name: { type: String, required: true },
      id: { type: String, required: true },
      joinDate: Number,
      discordIcon: { type: String },
      lastActive: Number,
      cockpitCharge: Number,
      skills: [
        {
          skill: String,
          level: Number,
          xp: Number,
        },
      ],
      location: String,
      stamina: Number,
      inventory: [{ id: { type: String }, amount: Number }],
      credits: Number,
      crewCosmeticCurrency: Number,
      actives: [
        {
          id: { required: true, type: String },
          cooldownRemaining: Number,
        },
      ],
      speciesId: String,
      permanentPassives: [
        {
          id: { required: true, type: String },
          intensity: Number,
        },
      ],
      combatTactic: String,
      targetitemType: String,
      minePriority: String,
      // attackGuilds: [String],
      targetLocation: [Number, Number],
      repairPriority: String,
      stats: [{ stat: String, amount: Number }],
      tutorialShipId: String,
      mainShipId: String,
    },
  ],
  commonCredits: Number,
  shipCosmeticCurrency: Number,
  orders:
    {
      verb: String,
      target: {
        name: String,
        id: { type: String },
        type: { type: String },
      },
      addendum: String,
    } || false,

  // ---- ai
  ai: { type: Boolean, default: false, required: true },
  spawnPoint: [Number, Number],
  level: Number,
  speciesId: String,
  onlyVisibleToShipId: String,
}
const shipSchema = new Schema(shipSchemaFields)
const DBShip = model<DBShipDoc>(`DBShip`, shipSchema)

const alreadyUpdating = new Set<string>()

export async function addOrUpdateInDb(
  data: Ship,
): Promise<BaseShipData | null> {
  // * make sure we don't overwrite an update in progress
  if (alreadyUpdating.has(data.id)) {
    const existing = (
      await DBShip.findOne({ id: data.id })
    )?.toObject() as any
    return existing
  }
  alreadyUpdating.add(data.id)

  // c.log(`will update`, data)
  const stub = data.stubify() as ShipStub
  // if (data.human)
  //   // stub.items = []
  //   c.log(
  //     `updating`,
  //     stub.id,
  //     Boolean(data.tutorial),
  //     stub.tutorial,
  //   )
  const toSave = (new DBShip(stub) as any)._doc
  delete toSave._id
  const dbObject: DBShipDoc | null =
    await DBShip.findOneAndUpdate({ id: data.id }, toSave, {
      upsert: true,
      new: true,
      lean: true,
      setDefaultsOnInsert: true,
    })

  alreadyUpdating.delete(data.id)

  // if (data.human) {
  //   const found = await DBShip.findOne({ id: data.id })
  //   if (found) c.log(`updated`, found)
  // }
  return dbObject as any
}

export async function removeFromDb(id: string) {
  const res = await DBShip.deleteOne({ id })
  // c.log(`Deleted ship`, id, res)
}
export async function removeByUnderscoreId(_id: string) {
  const res = await DBShip.deleteOne({ _id })
  c.log(`Deleted ship`, _id, res)
}

export async function wipe() {
  const res = await DBShip.deleteMany({})
  c.log(`Wiped ship DB`, res)
}
export async function wipeAI() {
  const res = await DBShip.deleteMany({ ai: true })
  c.log(`Wiped AIs from ship DB`, res)
}

export async function getAllConstructible(): Promise<
  BaseShipData[]
> {
  const docs: any = (await DBShip.find({})).map((d) =>
    d.toObject(),
  )
  // clearExtraneousMongooseIdEntry(docs)
  return docs as BaseShipData[]
}

function clearExtraneousMongooseIdEntry(obj: any) {
  if (obj && obj._id) delete obj._id
  if (typeof obj !== `object`) return
  if (Array.isArray(obj)) {
    obj.forEach(clearExtraneousMongooseIdEntry)
    return
  }
  Object.keys(obj).forEach((key) =>
    clearExtraneousMongooseIdEntry(obj[key]),
  )
}
