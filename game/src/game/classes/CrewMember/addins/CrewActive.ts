import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

const activeDefaults = {
  baseCooldown: 10000,
}

export class CrewActive {
  readonly crewMember: CrewMember
  readonly id: string
  readonly baseCooldown: number
  cooldownRemaining: number
  ready: Boolean = false

  constructor(
    { id }: BaseCrewActiveData,
    crewMember: CrewMember,
  ) {
    this.crewMember = crewMember
    this.id = id
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
