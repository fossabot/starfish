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
  location: [{ type: Number, required: true }],
  velocity: [{ type: Number, required: true }],
  name: { type: String, required: true },
  species: { id: String },
  loadout: String,
  chassis: { id: String },
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
    },
  ],
  seenPlanets: [{ name: String }],
  seenLandmarks: [{ type: { type: String }, id: String }],
  tutorial: {
    step: Number,
  },
  tagline: String,
  availableTaglines: [{ type: String }],
  headerBackground: String,
  availableHeaderBackgrounds: [{ type: String }],
  captain: String,
  logAlertLevel: String,
  stats: [{ stat: String, amount: Number }],
  crewMembers: [
    {
      name: { type: String, required: true },
      id: { type: String, required: true },
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
      actives: [
        {
          id: { required: true, type: String },
          cooldownRemaining: Number,
        },
      ],
      passives: [
        {
          id: { required: true, type: String },
          level: Number,
        },
      ],
      tactic: String,
      itemTarget: String,
      minePriority: String,
      attackFactions: [String],
      targetLocation: [Number, Number],
      repairPriority: String,
      stats: [{ stat: String, amount: Number }],
    },
  ],
  commonCredits: Number,

  // ---- ai
  ai: { type: Boolean, default: false },
  spawnPoint: [Number, Number],
  level: Number,
  onlyVisibleToShipId: String,
}
const shipSchema = new Schema(shipSchemaFields)
const DBShip = model<DBShipDoc>(`DBShip`, shipSchema)

export async function addOrUpdateInDb(
  data: Ship,
): Promise<BaseShipData> {
  const stub = c.stubify<Ship, ShipStub>(data)
  const toSave = (new DBShip(stub) as any)._doc
  delete toSave._id
  const dbObject: DBShipDoc | null =
    await DBShip.findOneAndUpdate({ id: data.id }, toSave, {
      upsert: true,
      new: true,
      lean: true,
      setDefaultsOnInsert: true,
    })
  return dbObject
}

export async function removeFromDb(id: string) {
  const res = await DBShip.deleteOne({ id })
  // c.log(`Deleted ship`, id, res)
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
  const docs = await DBShip.find({})
  return docs
}
