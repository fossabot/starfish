import c from '../../../../common/dist'

import type { CombatShip } from './Ship/CombatShip'
import { Stubbable } from './Stubbable'

export class AttackRemnant extends Stubbable {
  readonly id: string
  readonly attacker: CombatShip
  readonly defender: CombatShip
  readonly damageTaken: TakenDamageResult
  readonly start: CoordinatePair
  readonly end: CoordinatePair
  readonly time: number
  readonly onlyVisibleToShipId?: string

  // todo are these being stubified correctly? pre-db-save-and-load, that is

  constructor({
    attacker,
    defender,
    damageTaken,
    start,
    end,
    time,
    id,
    onlyVisibleToShipId,
  }: BaseAttackRemnantData) {
    super()
    this.id = id || `${Math.random()}`.substring(2)
    this.attacker = attacker
    this.defender = defender
    this.damageTaken = damageTaken
    this.start = start
    this.end = end
    this.time = time
    this.onlyVisibleToShipId = onlyVisibleToShipId
  }
}
