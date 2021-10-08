interface AdminGameSettings {
  id: string
  humanShipLimit: number
  aiDifficultyMultiplier: number
  baseXpGain: number
  baseStaminaUse: number
  brakeToThrustRatio: number
  baseEngineThrustMultiplier: number
  gravityMultiplier: number
  gravityCurveSteepness: number
  gravityRadius: number
  arrivalThreshold: number
  baseCritChance: number
  baseCritDamageMultiplier: number

  planetDensity: number
  zoneDensity: number
  aiShipDensity: number
  cacheDensity: number
}

interface AdminVisibleData {
  ships: ShipStub[]
  planets: PlanetStub[]
  caches: CacheStub[]
  attackRemnants: AttackRemnantStub[]
  zones: ZoneStub[]
  gameRadius: number
  showAll: true
}
