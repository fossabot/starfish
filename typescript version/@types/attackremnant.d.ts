interface BaseAttackRemnantData {
  attacker: CombatShip
  defender: CombatShip
  damageTaken: TakenDamageResult
  start: CoordinatePair
  end: CoordinatePair
  time: number
}
