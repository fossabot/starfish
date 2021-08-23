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
  cargoId: CargoId
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorChassisPrice {
  chassisId: ChassisId
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorItemPrice {
  itemType: ItemType
  itemId: ItemId
  buyMultiplier?: number
  sellMultiplier: number
}

interface VendorCrewActivePrice {
  activeId: CrewActiveId
  buyMultiplier: number
}

interface VendorCrewPassivePrice {
  passiveId: CrewPassiveId
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
