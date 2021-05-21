interface BaseCacheData {
  contents: CacheContents[]
  location: CoordinatePair
  time?: number
  message?: string
  id?: string
}

interface CacheContents {
  type: CargoType | `credits`
  amount: number
}
