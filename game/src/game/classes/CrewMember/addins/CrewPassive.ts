import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

export class CrewPassive {
  readonly displayName
  readonly crewMember
  readonly type
  level = 1
  readonly factor

  constructor(
    {
      displayName,
      type,
      level,
      factor,
    }: BaseCrewPassiveData,
    crewMember: CrewMember,
  ) {
    this.displayName = displayName
    this.crewMember = crewMember
    this.type = type
    if (level) this.level = level
    this.factor = factor
  }

  get changeAmount() {
    return this.level * this.factor
  }
}
