import c from '../../../../common/dist'
import { Stubbable } from './Stubbable'

export class AttackRemnant extends Stubbable {
  readonly id: string
  readonly type = `attackRemnant`
  readonly attacker: {
    id: string
    name: string
    type: string
    ai?: boolean
    toReference?: Function
  }

  readonly defender: {
    id: string
    name: string
    type: string
    ai?: boolean
    toReference?: Function
  }

  readonly damageTaken: TakenDamageResult
  readonly start: CoordinatePair
  readonly end: CoordinatePair
  readonly time: number
  readonly onlyVisibleToShipId?: string

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

  toVisibleStub<AttackRemnantStub>() {
    return {
      start: this.start,
      end: this.end,
      time: this.time,
      id: this.id,
      damageTaken: this.damageTaken,
    }
  }

  stubify<AttackRemnantStub>(
    d?: string[],
    a?: number,
  ): AttackRemnantStub {
    return {
      attacker: this.attacker?.toReference
        ? this.attacker.toReference()
        : this.attacker,
      defender: this.defender?.toReference
        ? this.defender.toReference()
        : this.defender,
      damageTaken: this.damageTaken,
      start: this.start,
      end: this.end,
      time: this.time,
      id: this.id,
    } as any
  }

  toAdminStub(): AttackRemnantStub {
    return this.stubify()
  }
}
