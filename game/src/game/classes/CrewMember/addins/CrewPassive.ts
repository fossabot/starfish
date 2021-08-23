import c from '../../../../../../common/dist'
import type { CrewMember } from '../CrewMember'

export class CrewPassive {
  readonly displayName: string
  readonly crewMember: CrewMember
  readonly id: CrewPassiveId
  level = 1
  readonly factor: number

  constructor(
    { displayName, id, level, factor }: BaseCrewPassiveData,
    crewMember: CrewMember,
  ) {
    this.displayName = displayName
    this.crewMember = crewMember
    this.id = id
    if (level) this.level = level
    this.factor = factor
  }

  get changeAmount() {
    return this.level * this.factor
  }
}
