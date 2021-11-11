import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'
import type { Zone } from '../../game/classes/Zone'

interface DBZoneDoc extends BaseZoneData, Document {
  id: string
}

const zoneSchemaFields: Record<keyof BaseZoneData, any> = {
  id: { type: String, required: true },
  name: String,
  radius: Number,
  color: String,
  location: [{ type: Number, required: true }],
  spawnTime: Number,
  passives: [
    {
      id: String,
      intensity: Number,
      data: Schema.Types.Mixed,
    },
  ],
  effects: [
    {
      type: { type: String },
      intensity: Number,
      basedOnProximity: Boolean,
      dodgeable: Boolean,
      procChancePerTick: Number,
      data: {
        direction: Number,
      },
    },
  ],
}
const zoneSchema = new Schema(zoneSchemaFields)
const DBZone = model<DBZoneDoc>(`DBZone`, zoneSchema)

export async function addOrUpdateInDb(
  data: Zone,
): Promise<BaseZoneData> {
  const toSave = (new DBZone(data) as any)._doc
  delete toSave._id
  const dbObject: DBZoneDoc | null =
    await DBZone.findOneAndUpdate({ id: data.id }, toSave, {
      upsert: true,
      new: true,
      lean: true,
      setDefaultsOnInsert: true,
    })
  return dbObject as any
}

export async function wipe() {
  const res = await DBZone.deleteMany({})
  c.log(`Wiped zone DB`, res)
}

export async function removeFromDb(id: string) {
  const res = await DBZone.deleteMany({ id })
}

export async function getAllConstructible(): Promise<
  BaseZoneData[]
> {
  const docs = (await DBZone.find({})).map((z) =>
    z.toObject(),
  ) as any
  return docs
}
