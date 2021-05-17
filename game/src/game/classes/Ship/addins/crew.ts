import c from '../../../../../../common/dist'
import { HumanShip } from '../HumanShip'
import { Ship } from '../Ship'

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
  s: SkillName,
): number {
  return this.membersIn(l).reduce((total, m) => {
    return (
      total +
      (m.skills.find((skill) => skill.skill === s)?.level ||
        0)
    )
  }, 0)
}
