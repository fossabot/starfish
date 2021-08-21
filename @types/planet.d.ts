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
  cargoType: CargoType
  cargoData?: BaseCargoData
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorChassisPrice {
  chassisType: ChassisId
  chassisData?: BaseChassisData
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorItemPrice {
  itemType: ItemType
  itemId: ItemId
  itemData?: BaseItemData
  buyMultiplier?: number
  sellMultiplier: number
}

interface VendorCrewActivePrice {
  activeType: CrewActiveType
  activeData?: BaseActiveData
  buyMultiplier: number
}

interface VendorCrewPassivePrice {
  passiveType: CrewPassiveType
  passiveData?: BaseCrewPassiveData
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
