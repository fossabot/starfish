import { Schema, model, Document, Types } from 'mongoose'
import c from '../../../../common/dist'
import type { Planet } from '../../game/classes/Planet'

interface DBPlanetDoc
  extends BasePlanetData,
    BasePlanetData,
    Document {
  id: string
}

const planetSchemaFields: Record<
  keyof BasePlanetData,
  any
> = {
  location: [{ type: Number, required: true }],
  color: String,
  name: { type: String, required: true },
  radius: Number,
  factionId: String,
  creatures: [String],
  homeworld: { id: String },
  repairCostMultiplier: Number,
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
        type: String,
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
  const stub = c.stubify<Planet, PlanetStub>(data)
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
  const res = await DBPlanet.deleteOne({ name })
  c.log(`Deleted planet`, name, res)
}

export async function wipe() {
  const res = await DBPlanet.deleteMany({})
  c.log(`Wiped planet DB`, res)
}

export async function getAllConstructible(): Promise<
  BasePlanetData[]
> {
  const docs = await DBPlanet.find({})
  return docs
}
