type ChassisId = `starter` | `second`

type EngineId = `starter`
type WeaponId = `cannon`
type ScannerId = `starter`
type CommunicatorId = `starter`
type ArmorId = `starter`

type ItemType =
  | `weapon`
  | `engine`
  | `scanner`
  | `communicator`
  | `armor`
type ItemId =
  | WeaponId
  | EngineId
  | ScannerId
  | CommunicatorId
  | ArmorId

interface BaseChassisData {
  id: ChassisId
  type: `chassis`
  basePrice: number
  displayName: string
  description: string
  slots: number
  rarity: number
}

interface BaseItemData {
  id: ItemId
  type: ItemType
  displayName: string
  description: string
  basePrice: number
  rarity: number
  repair?: number
  hp?: number
  maxHp: number
  lastUse?: number
  [key: keyof BaseWeaponData | keyof BaseEngineData]: any // to cover generalized item type contruction
}

type LoadoutName = `humanDefault` | `aiDefault`
type Loadout = {
  chassis: ChassisId
  items: { type: ItemType; id: ItemId }[]
}

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

interface BaseArmorData extends BaseItemData {
  type: `armor`
  id: ArmorId
  damageReduction: number
}

interface BaseScannerData extends BaseItemData {
  type: `scanner`
  id: ScannerId
  sightRange: number
  shipScanRange: number
}

interface BaseCommunicatorData extends BaseItemData {
  type: `communicator`
  id: CommunicatorId
  range: number
  antiGarble: number
}
