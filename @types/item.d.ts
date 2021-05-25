type EngineId = `starter`
type WeaponId = `cannon`

type ItemType = `weapon` | `engine`
type ItemId = WeaponId | EngineId

interface BaseItemData {
  id: ItemId
  type: ItemType
  displayName: string
  description: string
  repair?: number
  hp?: number
  maxHp: number
  lastUse?: number
  [key: keyof BaseWeaponData | keyof BaseEngineData]: any // to cover generalized item type contruction
}

type LoadoutName = `humanDefault` | `aiDefault`
type Loadout = { type: ItemType; id: ItemId }[]

interface BaseWeaponData extends BaseItemData {
  type: `weapon`
  id: WeaponId
  range: number
  damage: number
  baseCooldown: number
  cooldownRemaining?: number
}

interface BaseEngineData extends BaseItemData {
  type: `engine`
  id: EngineId
  thrustAmplification: number
}
