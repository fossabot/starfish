import c from '../../../../common/dist'

import { Game } from '../Game'
import { CombatShip } from './Ship/CombatShip'

export class AttackRemnant {
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
  }: BaseAttackRemnantData) {
    this.attacker = attacker
    this.defender = defender
    this.damageTaken = damageTaken
    this.start = start
    this.end = end
    this.time = time
  }
}
