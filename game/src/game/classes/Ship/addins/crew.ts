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
