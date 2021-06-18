import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

const activeDefaults = {
  baseCooldown: 10000,
}

export class CrewActive {
  readonly crewMember: CrewMember
  readonly type: string
  readonly baseCooldown: number
  cooldownRemaining: number
  ready: Boolean = false

  constructor(
    { type }: BaseCrewActiveData,
    crewMember: CrewMember,
  ) {
    this.crewMember = crewMember
    this.type = type
    this.baseCooldown = activeDefaults.baseCooldown
    this.cooldownRemaining = this.baseCooldown
  }

  tick() {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining -= this.crewMember.stamina
      this.ready = false
      if (this.cooldownRemaining <= 0) this.ready = true
      this.crewMember.toUpdate.actives =
        this.crewMember.actives
    }
  }
}
