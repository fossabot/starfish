type PlanetType = `basic` | `mining`

interface BasePlanetData {
  planetType: PlanetType
  id: string
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
  leanings: PlanetLeaning[]
  factionId?: FactionId
  homeworld?: { id: FactionId }
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

interface PlanetVendorCrewPassivePrice {
  id: CrewPassiveId
  buyMultiplier: number
  intensity: number
}

interface PlanetVendor {
  cargo: PlanetVendorCargoPrice[]
  items: PlanetVendorItemPrice[]
  chassis: PlanetVendorChassisPrice[]
  passives: PlanetVendorCrewPassivePrice[]
  repairCostMultiplier?: number
}

interface PlanetAllegianceData {
  factionId: FactionId
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
