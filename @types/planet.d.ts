interface BasePlanetData {
  name: string
  color: string
  location: CoordinatePair
  radius: number
  mass: number
  landingRadiusMultiplier: number
  repairFactor: number

  level: number
  xp: number
  baseLevel: number

  leanings: PlanetLeaning[]

  factionId?: FactionKey
  homeworld?: { id: FactionKey }
  creatures: string[]
  allegiances?: PlanetAllegianceData[]
  vendor?: PlanetVendor
}

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

interface PlanetLeaning {
  type:
    | `items`
    | `chassis`
    | `passives`
    | `actives`
    | `cargo`
    | `repair`
  never?: boolean
  propensity?: number
}
