type ChassisId =
  | `starter1`
  | `starter2`
  | `starter3`
  | `fighter1`
  | `fighter2`
  | `fighter3`
  | `hauler1`
  | `hauler2`
  | `hauler3`
  | `sailer1`
  | `sailer2`
  | `sailer3`
  | `mega1`
  | `mega2`
  | `mega3`

type EngineId =
  | `tutorial1`
  | `starter1`
  | `starter2`
  | `starter3`
  | `basic1`
  | `basic2`
  | `basic3`
  | `glass1`
  | `glass2`
  | `glass3`
  | `heavy1`
  | `heavy2`
  | `heavy3`

type WeaponId =
  | `tutorial1`
  | `cannon1`
  | `cannon2`
  | `cannon3`
  | `saber1`
  | `saber2`
  | `saber3`
  | `sniper1`
  | `sniper2`
  | `sniper3`
  | `tiny1`
type ScannerId =
  | `tutorial1`
  | `starter1`
  | `starter2`
  | `peek1`
  | `peek2`
  | `peek3`
  | `wide1`
  | `wide2`
  | `wide3`
  | `shipscanner1`
  | `shipscanner2`
  | `shipscanner3`
  | `treasure1`
type CommunicatorId =
  | `starter1`
  | `starter2`
  | `distance1`
  | `distance2`
  | `distance3`
  | `distance4`
  | `clarity1`
  | `clarity2`
  | `clarity3`
type ArmorId =
  | `starter1`
  | `starter2`
  | `block1`
  | `block2`
  | `block3`
  | `block4`
  | `tough1`
  | `tough2`
  | `tough3`

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
  mass: number
  basePrice: number
  displayName: string
  description: string
  slots: number
  agility: number
  maxCargoSpace: number
  rarity: number
  passives?: ShipPassiveEffect[]
}

interface BaseItemData {
  id: ItemId
  type: ItemType
  displayName: string
  description: string
  mass: number
  basePrice: number
  rarity: number
  reliability?: number
  repairDifficulty?: number
  repair?: number
  hp?: number
  maxHp: number
  buyable?: false
  aiOnly?: boolean
  lastUse?: number
  passives?: ShipPassiveEffect[]
  rooms?: CrewLocation[]
  [key: keyof BaseWeaponData | keyof BaseEngineData]: any // to cover generalized item type contruction
}

type LoadoutId =
  | `tutorial1`
  | `tutorial2`
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
  critChance?: number
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
  headerBackground: true
  tagline: true
  previousLocations: true
  location: true
  ai: true
  human: true
  level: true
  attackable: true
  planet:
    | (keyof BasePlanetData)[]
    | (keyof BaseBasicPlanetData)[]
  guildId: true
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
