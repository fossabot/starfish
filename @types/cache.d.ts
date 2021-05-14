interface BaseCacheData {
  contents: CacheContents[]
  location: CoordinatePair
  ownerId: string
  message?: string
}

interface CacheContents {
  type: CargoType
  amount: number
}
