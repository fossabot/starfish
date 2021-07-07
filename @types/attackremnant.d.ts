interface BaseAttackRemnantData {
  id?: string
  attacker: CombatShip
  defender: CombatShip
  damageTaken: TakenDamageResult
  start: CoordinatePair
  end: CoordinatePair
  time: number
  onlyVisibleToShipId?: string
}
