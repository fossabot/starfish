type ChassisId = `starter1` | `starter2` | `solo1`

type EngineId = `starter1` | `starter2` | `tutorial1`
type WeaponId =
  | `cannon1`
  | `cannon2`
  | `saber1`
  | `sniper1`
  | `tiny1`
  | `tutorial1`
type ScannerId = `starter1` | `starter2` | `shipscanner1`
type CommunicatorId = `starter1` | `starter2`
type ArmorId = `starter1` | `starter2`

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
  bunks: number
  rarity: number
}

interface BaseItemData {
  id: ItemId
  type: ItemType
  displayName: string
  description: string
  basePrice: number
  rarity: number
  reliability?: number
  repairDifficulty?: number
  repair?: number
  hp?: number
  maxHp: number
  lastUse?: number
  [key: keyof BaseWeaponData | keyof BaseEngineData]: any // to cover generalized item type contruction
}

type LoadoutName =
  | `tutorial1`
  | `tutorial2`
  | `tutorial3`
  | `humanDefault`
  | `aiTutorial1`
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

interface BaseCommunicatorData extends BaseItemData {
  type: `communicator`
  id: CommunicatorId
  range: number
  antiGarble: number
}

interface BaseScannerData extends BaseItemData {
  type: `scanner`
  id: ScannerId
  sightRange: number
  shipScanRange: number
  shipScanData: ShipScanDataShape
}

interface ShipScanDataShape {
  id: true
  name: true
  previousLocations: true
  location: true
  ai: true
  human: true
  attackable: true
  planet: (keyof BasePlanetData)[]
  faction: (keyof BaseFactionData)[]
  species: (keyof BaseSpeciesData)[]
  items?: (
    | keyof BaseItemData
    | keyof BaseWeaponData
    | keyof BaseArmorData
    | keyof BaseScannerData
    | keyof BaseCommunicatorData
    | keyof BaseEngineData
  )[]
  crewMembers?: (keyof BaseCrewMemberData)[]
  rooms?: boolean
  chassis?: (keyof BaseChassisData)[]
  _hp?: boolean
  _maxHp?: boolean
  attackable?: boolean
  targetShip?: boolean
  radii?: RadiusType[]
}
