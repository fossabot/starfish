import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'
import { HumanShip } from '../../game/classes/Ship/HumanShip'
import { CrewMember } from '../../game/classes/CrewMember/CrewMember'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(
    `crew:add`,
    (shipId, crewMemberBaseData, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: 'No ship found by that id.',
        })

      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewMemberBaseData.id,
      )
      if (crewMember)
        return callback({
          error: 'Crew member already exists on this ship.',
        })

      const addedCrewMember = ship.addCrewMember(
        crewMemberBaseData,
      )
      const stub = stubify<CrewMember, CrewMemberStub>(
        addedCrewMember,
      )
      callback({ data: stub })
    },
  )

  socket.on(`crew:move`, (shipId, crewId, target) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return

    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember) return

    crewMember.location = target
    c.log(
      'Set crew member',
      crewMember.name,
      'on ship',
      ship.name,
      'location to',
      target,
    )
  })
}
