import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'

interface DBGameDoc extends Document, PersistentGameData {}

const gameSchemaFields: Record<
  keyof PersistentGameData,
  any
> = {
  minimumGameRadius: Number,
  paused: Boolean,
  gameInitializedAt: Number,
}
const gameSchema = new Schema(gameSchemaFields)
const DBGame = model<DBGameDoc>(`DBGame`, gameSchema)

export async function addOrUpdateInDb(
  data: PersistentGameData,
): Promise<PersistentGameData> {
  const toSave = (new DBGame(data) as any)._doc
  delete toSave._id
  const dbObject: DBGameDoc | null =
    await DBGame.findOneAndUpdate({}, toSave, {
      upsert: true,
      new: true,
      lean: true,
      setDefaultsOnInsert: true,
    })
  return dbObject as any
}

export async function wipe() {
  const res = await DBGame.deleteMany({})
  c.log(`Wiped game DB`, res)
}

export async function get(): Promise<PersistentGameData> {
  const doc = (await DBGame.findOne({}))?.toObject() || {}
  return doc
}
