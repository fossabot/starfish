interface BaseCacheData {
  contents: CacheContents[]
  location: CoordinatePair
  time?: number
  message?: string
  id?: string
  droppedBy?: string
  onlyVisibleToShipId?: string
}

interface CacheContents {
  type: CargoType | `credits`
  amount: number
}
