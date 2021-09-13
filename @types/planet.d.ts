type PlanetType = `basic` | `mining`

interface BasePlanetData {
  planetType: PlanetType
  name: string
  color: string
  location: CoordinatePair
  radius: number
  mass: number
  landingRadiusMultiplier: number
  level: number
  xp: number
  baseLevel: number
  creatures: string[]
  passives?: ShipPassiveEffect[]
  pacifist?: boolean
  stats?: PlanetStats
}

interface BaseBasicPlanetData extends BasePlanetData {
  repairFactor: number
  leanings: PlanetLeaning[]
  factionId?: FactionKey
  homeworld?: { id: FactionKey }
  allegiances: PlanetAllegianceData[]
  vendor: PlanetVendor
}

interface BaseMiningPlanetData extends BasePlanetData {
  mine?: PlanetMine
}

interface PlanetMineEntry {
  id: CargoId
  payoutAmount: number
  mineRequirement: number
  mineCurrent: number
}
type PlanetMine = PlanetMineEntry[]

interface PlanetVendorCargoPrice {
  id: CargoId
  buyMultiplier: number
  sellMultiplier: number
}

interface PlanetVendorChassisPrice {
  id: ChassisId
  buyMultiplier: number
}

interface PlanetVendorItemPrice {
  type: ItemType
  id: ItemId
  buyMultiplier: number
}

interface PlanetVendorCrewActivePrice {
  id: CrewActiveId
  buyMultiplier: number
}

interface PlanetVendorCrewPassivePrice {
  id: CrewPassiveId
  buyMultiplier: number
}

interface PlanetVendor {
  cargo: PlanetVendorCargoPrice[]
  items: PlanetVendorItemPrice[]
  chassis: PlanetVendorChassisPrice[]
  passives: PlanetVendorCrewPassivePrice[]
  actives: PlanetVendorCrewActivePrice[]
  repairCostMultiplier?: number
}

interface PlanetAllegianceData {
  faction: FactionStub
  level: number
}

type PlanetLeaningType =
  | `items`
  | `weapon`
  | `armor`
  | `scanner`
  | `communicator`
  | `engine`
  | `chassis`
  | `crewPassives`
  | `shipPassives`
  | `actives`
  | `cargo`
  | `repair`
interface PlanetLeaning {
  type: PlanetLeaningType
  never?: boolean
  propensity?: number
}

type PlanetStatKey = `totalDonated` | `shipsLanded`
interface PlanetStatEntry {
  stat: PlanetStatKey
  amount: number
}
