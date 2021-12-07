import c from '../../../../../../common/dist'
import { HumanShip } from '../HumanShip/HumanShip'

export function membersIn(
  this: HumanShip,
  location: CrewLocation,
) {
  return this.crewMembers.filter(
    (cm) => cm.stamina > 0 && cm.location === location,
  )
}

export function cumulativeSkillIn(
  this: HumanShip,
  l: CrewLocation,
  s: SkillId,
): number {
  return this.membersIn(l).reduce((total, m) => {
    return total + m[s].level
  }, 0)
}
