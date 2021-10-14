import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'

interface DBGameSettingsDoc
  extends AdminGameSettings,
    Document {
  id: string
}

const gameSettingsSchemaFields: Record<
  keyof AdminGameSettings,
  any
> = {
  id: { type: String, required: true },
  humanShipLimit: { type: Number, required: true },
  aiDifficultyMultiplier: { type: Number, required: true },
  baseXpGain: { type: Number, required: true },
  baseStaminaUse: { type: Number, required: true },
  brakeToThrustRatio: { type: Number, required: true },
  baseEngineThrustMultiplier: {
    type: Number,
    required: true,
  },
  gravityMultiplier: { type: Number, required: true },
  gravityCurveSteepness: { type: Number, required: true },
  gravityRadius: { type: Number, required: true },
  arrivalThreshold: { type: Number, required: true },
  baseCritChance: { type: Number, required: true },
  baseCritDamageMultiplier: {
    type: Number,
    required: true,
  },
  staminaBottomedOutResetPoint: {
    type: Number,
    required: true,
  },

  planetDensity: { type: Number, required: true },
  cometDensity: { type: Number, required: true },
  zoneDensity: { type: Number, required: true },
  aiShipDensity: { type: Number, required: true },
  cacheDensity: { type: Number, required: true },
}
const gameSettingsSchema = new Schema(
  gameSettingsSchemaFields,
)
const DBGameSettings = model<DBGameSettingsDoc>(
  `DBGameSettings`,
  gameSettingsSchema,
)

export async function addOrUpdateInDb(
  data: AdminGameSettings,
): Promise<AdminGameSettings> {
  const toSave = (new DBGameSettings(data) as any)._doc
  delete toSave._id
  const dbObject: DBGameSettingsDoc | null =
    await DBGameSettings.findOneAndUpdate(
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
  const res = await DBGameSettings.deleteMany({})
  c.log(`Wiped gameSettings DB`, res)
}

export async function removeFromDb(id: string) {
  const res = await DBGameSettings.deleteMany({ id })
}

export async function getAllConstructible(): Promise<
  AdminGameSettings[]
> {
  const docs = (await DBGameSettings.find({})).map((z) =>
    z.toObject(),
  )
  return docs
}
