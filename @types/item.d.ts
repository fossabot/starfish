type ItemType = `weapon` | `engine`

interface BaseItemData {
  id: string
  displayName: string
  description: string
  repair?: number
}

interface Loadout {
  name: string
  weapons: BaseWeaponData[]
  engines: BaseEngineData[]
}

interface BaseWeaponData extends BaseItemData {
  range: number
  damage: number
  baseCooldown: number
}

interface BaseEngineData extends BaseItemData {
  thrustAmplification: number
}
