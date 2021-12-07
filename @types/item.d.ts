type ChassisId =
  | `tiny1`
  | `drone1`
  | `ai1`
  | `ai2`
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
  | `tiny1`
  | `ai1`
  | `tutorial1`
  | `starter1`
  | `starter2`
  | `starter3`
  | `basic1`
  | `basic2`
  | `basic3`
  | `duo1`
  | `duo2`
  | `duo3`
  | `glass1`
  | `glass2`
  | `glass3`
  | `passive1`
  | `passive2`
  | `heavy1`
  | `heavy2`
  | `heavy3`

type WeaponId =
  | `tutorial1`
  | `drone1`
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
  | `blaster1`
  | `blaster2`
  | `blaster3`
type ScannerId =
  | `tutorial1`
  | `starter1`
  | `starter2`
  | `peek1`
  | `peek2`
  | `peek3`
  | `peek4`
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

interface BaseItemOrChassisData {
  type: `item` | `chassis`
  mass: number
  basePrice: Price
  displayName: string
  description: string
  rarity: number
  passives?: ShipPassiveEffect[]
  buyable?: false
  special?: true
  rooms?: CrewLocation[]
  aiOnly?: boolean
}

interface BaseChassisData extends BaseItemOrChassisData {
  chassisId: ChassisId
  type: `chassis`
  slots: number
  agility: number
  maxCargoSpace: number
}

interface BaseItemData extends BaseItemOrChassisData {
  type: `item`
  id?: string
  itemId: ItemId
  itemType: ItemType
  reliability?: number
  repairDifficulty?: number
  repair?: number
  hp?: number
  maxHp: number
  lastUse?: number
  upgradeRequirements?: ItemUpgradeRequirements
  upgradableProperties?: UpgradableProperty[]
  upgradeBonus?: number
  level?: number
  maxLevel?: number

  [key: keyof BaseWeaponData | keyof BaseEngineData]: any // to cover generalized item type contruction
}

type LoadoutId =
  | `tutorial1`
  | `tutorial2`
  | `humanDefault`
  | `aiTutorial1`
  | `testManualEngine`
  | `testPassiveEngine`
  | `testMega`
type Loadout = {
  chassisId: ChassisId
  items: { itemType: ItemType; itemId: ItemId }[]
}

interface BaseWeaponData extends BaseItemData {
  itemType: `weapon`
  itemId: WeaponId
  range: number
  damage: number
  chargeRequired: number
  cooldownRemaining?: number
  critChance?: number
}

interface BaseEngineData extends BaseItemData {
  itemType: `engine`
  itemId: EngineId
  passiveThrustMultiplier?: number
  manualThrustMultiplier?: number
}

interface BaseArmorData extends BaseItemData {
  itemType: `armor`
  itemId: ArmorId
  damageReduction: number
}

interface BaseCommunicatorData extends BaseItemData {
  itemType: `communicator`
  itemId: CommunicatorId
  range: number
  clarity: number
}

interface BaseScannerData extends BaseItemData {
  itemType: `scanner`
  itemId: ScannerId
  sightRange: number
  shipScanRange: number
  shipScanData: ShipScanDataShape
  scanPlanets?: boolean
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
  mass?: boolean
  chassis?: (keyof BaseChassisData)[]
  speed?: boolean
  direction?: boolean
  _hp?: boolean
  _maxHp?: boolean
  attackable?: boolean
  targetShip?: boolean
  radii?: RadiusType[]
  debugLocations?: boolean
}

interface ItemUpgradeRequirement {
  required: number
  current: number
  research?: boolean
  cargoId?: CargoId
  researchCurrency?: boolean
}
type ItemUpgradeRequirements = ItemUpgradeRequirement[]

type UpgradableProperty =
  | `damageReduction`
  | `range`
  | `clarity`
  | `passiveThrustMultiplier`
  | `manualThrustMultiplier`
  | `repairDifficulty`
  | `reliability`
  | `sightRange`
  | `shipScanRange`
  | `damage`
  | `critChance`
  | `chargeRequired`
  | `mass`
  | `maxHp`
