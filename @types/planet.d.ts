interface BasePlanetData {
  name: string
  color: string
  location: CoordinatePair
  radius: number
  factionId?: FactionKey
  homeworld?: { id: FactionKey }
  creatures: string[]
  repairCostMultiplier?: number
  allegiances?: AllegianceData[]
  vendor?: Vendor
}

interface VendorCargoPrice {
  id: CargoId
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorChassisPrice {
  id: ChassisId
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorItemPrice {
  type: ItemType
  id: ItemId
  buyMultiplier?: number
  sellMultiplier: number
}

interface VendorCrewActivePrice {
  id: CrewActiveId
  buyMultiplier: number
}

interface VendorCrewPassivePrice {
  id: CrewPassiveId
  buyMultiplier: number
}

interface Vendor {
  cargo: VendorCargoPrice[]
  items: VendorItemPrice[]
  chassis: VendorChassisPrice[]
  passives: VendorCrewPassivePrice[]
  actives: VendorCrewActivePrice[]
}

interface AllegianceData {
  faction: FactionStub
  level: number
}
