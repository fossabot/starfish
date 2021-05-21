type EngineType = `starter`
type WeaponType = `cannon`

type ItemType = `weapon` | `engine`

interface BaseItemData {
  type: ItemType
  id: string
  displayName: string
  description: string
  repair?: number
  hp?: number
  maxHp: number
  lastUse?: number
}

interface Loadout {
  name: string
  weapons: BaseWeaponData[]
  engines: BaseEngineData[]
}

interface BaseWeaponData extends BaseItemData {
  id: WeaponType
  range: number
  damage: number
  baseCooldown: number
  cooldownRemaining?: number
}

interface BaseEngineData extends BaseItemData {
  id: EngineType
  thrustAmplification: number
}
