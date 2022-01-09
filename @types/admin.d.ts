interface AdminGameSettings {
  id: string
  humanShipLimit: number
  safeZoneRadius: number
  contractLocationRadius: number
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
  staminaBottomedOutResetPoint: number
  staminaBottomedOutChargeMultiplier: number
  staminaRechargeMultiplier: number
  enduranceXpGainPerSecond: number
  newCrewMemberCredits: number
  planetDensity: number
  cometDensity: number
  zoneDensity: number
  aiShipDensity: number
  cacheDensity: number
  moraleLowThreshold: number
  moraleHighThreshold: number
}

interface AdminVisibleData {
  ships: ShipStub[]
  planets: PlanetStub[]
  comets: PlanetStub[]
  caches: CacheStub[]
  attackRemnants: AttackRemnantStub[]
  zones: ZoneStub[]
  gameRadius: number
  safeZoneRadius: number
  showAll: true
  trails: undefined
}
