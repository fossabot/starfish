type PlanetType = `basic` | `mining` | `comet`

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
  defense?: number
  passives?: ShipPassiveEffect[]
  pacifist?: boolean
  stats?: PlanetStats
}

interface BaseBasicPlanetData extends BasePlanetData {
  leanings: PlanetLeaning[]
  guildId?: GuildId
  allegiances: PlanetAllegianceData[]
  vendor: PlanetVendor
  bank: boolean
  maxContracts?: number
  contracts?: PlanetContractAvailable[]
}

interface BaseMiningPlanetData extends BasePlanetData {
  mine?: PlanetMine
}

interface BaseCometData extends BaseMiningPlanetData {
  velocity: CoordinatePair
  trail?: CoordinatePair[]
}

interface PlanetMineEntry {
  id: MineableResource
  payoutAmount: number
  mineRequirement: number
  mineCurrent: number
  maxMineable?: number
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

interface PlanetShipCosmetic extends ShipCosmetic {
  priceMultiplier: number
}

interface PlanetVendor {
  cargo: PlanetVendorCargoPrice[]
  items: PlanetVendorItemPrice[]
  chassis: PlanetVendorChassisPrice[]
  passives: PlanetVendorCrewPassivePrice[]
  shipCosmetics: PlanetShipCosmetic[]
  repairCostMultiplier?: number
}

interface PlanetAllegianceData {
  guildId: GuildId
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
  | `cosmetics`
  | `defense`
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

interface PlanetContractAvailable {
  id: string
  targetId: string
  targetName: string
  targetGuildId?: GuildId
  claimableExpiresAt: number
  timeAllowed: number
  reward: Price
  difficulty: number
  claimCost: Price
}
