import { Schema, model, Document } from 'mongoose'
import c from '../../../../common/dist'
import type { AttackRemnant } from '../../game/classes/AttackRemnant'

interface DBAttackRemnantDoc
  extends BaseAttackRemnantData,
    Document {
  id: string
}

const attackRemnantSchemaFields: Record<
  keyof BaseAttackRemnantData,
  any
> = {
  id: { type: String, required: true },
  attacker: {
    id: String,
    name: String,
  },
  defender: {
    id: String,
    name: String,
  },
  time: { type: Number, default: Date.now() },
  start: [{ type: Number, required: true }],
  end: [{ type: Number, required: true }],
  damageTaken: {
    damageTaken: Number,
    didDie: Boolean,
    weapon: {
      id: String,
    },
  },
  onlyVisibleToShipId: { type: String },
}

const attackRemnantSchema = new Schema(
  attackRemnantSchemaFields,
)
const DBAttackRemnant = model<DBAttackRemnantDoc>(
  `DBAttackRemnant`,
  attackRemnantSchema,
)

export async function addOrUpdateInDb(
  data: AttackRemnant,
): Promise<BaseAttackRemnantData> {
  const toSave = (new DBAttackRemnant(data) as any)._doc
  delete toSave._id
  const dbObject: DBAttackRemnantDoc | null =
    await DBAttackRemnant.findOneAndUpdate(
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
  const res = await DBAttackRemnant.deleteMany({})
  c.log(`Wiped attack remnant DB`, res)
}

export async function removeFromDb(id: string) {
  const res = await DBAttackRemnant.deleteMany({ id })
}

export async function getAllConstructible(): Promise<
  BaseAttackRemnantData[]
> {
  const docs = (await DBAttackRemnant.find({})).map((z) =>
    z.toObject(),
  ) as any
  return docs
}
