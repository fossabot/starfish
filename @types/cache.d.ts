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
  id: CargoId | `credits`
  amount: number
}
