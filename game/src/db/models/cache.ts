import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'
import type { Cache } from '../../game/classes/Cache'

interface DBCacheDoc extends BaseCacheData, Document {
  id: string
}

const cacheSchemaFields: Record<keyof BaseCacheData, any> =
  {
    id: { type: String, required: true },
    time: { type: Number, default: Date.now() },
    location: [{ type: Number, required: true }],
    message: { type: String, default: `` },
    contents: [{ type: { type: String }, amount: Number }],
    droppedBy: String,
  }
const cacheSchema = new Schema(cacheSchemaFields)
const DBCache = model<DBCacheDoc>(`DBCache`, cacheSchema)

export async function addOrUpdateInDb(
  data: Cache,
): Promise<BaseCacheData> {
  const toSave = (new DBCache(data) as any)._doc
  delete toSave._id
  const dbObject: DBCacheDoc | null =
    await DBCache.findOneAndUpdate(
      { id: data.id },
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

export async function wipe() {
  const res = await DBCache.deleteMany({})
  c.log(`Wiped cache DB`, res)
}

export async function removeFromDb(id: string) {
  const res = await DBCache.deleteOne({ id })
}

export async function getAllConstructible(): Promise<
  BaseCacheData[]
> {
  const docs = await DBCache.find({})
  return docs
}
