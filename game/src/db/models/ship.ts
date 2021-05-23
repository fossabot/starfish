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
  keyof BaseHumanShipData,
  any
> = {
  id: { type: String, required: true },
  location: [{ type: Number, required: true }],
  name: { type: String, required: true },
  faction: { color: String },
  loadout: String,
  engines: [{ id: String, repair: Number }],
  weapons: [
    {
      id: String,
      repair: Number,
      cooldownRemaining: Number,
    },
  ],
  previousLocations: [[Number, Number]],

  // ----- human
  log: [{ text: String, time: Number, level: String }],
  seenPlanets: [{ name: String }],
  captain: String,
  crewMembers: [
    {
      name: { type: String, required: true },
      id: { type: String, required: true },
      skills: [
        {
          skill: String,
          level: Number,
          xp: Number,
        },
      ],
      location: String,
      stamina: Number,
      inventory: [
        { type: { type: String }, amount: Number },
      ],
      credits: Number,
      actives: [String],
      tactic: String,
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
  c.log(`Deleted ship`, id, res)
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
