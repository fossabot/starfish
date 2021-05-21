import c from '../../../../../common/dist'
import type { CrewMember } from './CrewMember'

const activeDefaults = {
  baseCooldown: 10000,
}

export class Active {
  readonly crewMember: CrewMember
  readonly id: string
  readonly baseCooldown: number
  cooldownRemaining: number
  ready: Boolean = false

  constructor(
    { id }: BaseActiveData,
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
    } else this.ready = true
  }
}
