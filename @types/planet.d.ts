type PlanetName = `Origin` | `Hera` | `Osiris`

interface BasePlanetData {
  name: string
  color: string
  location: CoordinatePair
  radius: number
  faction?: { color: FactionKey }
  races?: string[]
  repairCostMultiplier?: number
  vendor?: Vendor
}

interface VendorCargoPrice {
  cargoData: CargoData
  buyMultiplier: number
  sellMultiplier: number
}

interface VendorItemPrice {
  cargoData: BaseItemData
  buyMultiplier: number
  sellMultiplier: number
}

interface Vendor {
  cargo?: VendorCargoPrice[]
  items?: {
    [key: ItemType]: VendorItemPrice[]
  }
}
