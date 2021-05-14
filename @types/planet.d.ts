type PlanetName = 'Origin' | 'Hera'

interface BasePlanetData {
  name: string
  color: string
  location: CoordinatePair
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
