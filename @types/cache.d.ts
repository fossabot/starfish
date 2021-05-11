interface BaseCacheData {
  contents: CacheContents[]
  location: CoordinatePair
  ownerId: string
  message?: string
}

interface CacheContents {
  type: string
  amount: number
}
