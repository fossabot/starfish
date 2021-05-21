import c from '../../../../common/dist'

import type { CombatShip } from './Ship/CombatShip'

export class AttackRemnant {
  static readonly expireTime = 1000 * 60 * 60 * 1

  readonly id: string
  readonly attacker: CombatShip
  readonly defender: CombatShip
  readonly damageTaken: TakenDamageResult
  readonly start: CoordinatePair
  readonly end: CoordinatePair
  readonly time: number

  constructor({
    attacker,
    defender,
    damageTaken,
    start,
    end,
    time,
    id,
  }: BaseAttackRemnantData) {
    this.id = id || `${Math.random()}`.substring(2)
    this.attacker = attacker
    this.defender = defender
    this.damageTaken = damageTaken
    this.start = start
    this.end = end
    this.time = time
  }
}
