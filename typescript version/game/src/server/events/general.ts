import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'
import { HumanShip } from '../../game/classes/Ship/HumanShip'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(
    `ships:forUser:fromIdArray`,
    (shipIds, userId, callback) => {
      const foundShips = game.ships.filter(
        (s) =>
          s instanceof HumanShip &&
          shipIds.includes(s.id) &&
          s.crewMembers.find((cm) => cm.id === userId),
      )
      if (foundShips.length) {
        const shipsAsStubs = foundShips.map((s) =>
          stubify<Ship, ShipStub>(s),
        )
        callback({
          data: shipsAsStubs,
        })
      } else
        callback({ error: `No ships found by those IDs.` })
    },
  )

  socket.on(`ship:get`, (id, callback) => {
    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) {
      const stub = stubify<Ship, ShipStub>(foundShip)
      callback({
        data: stub,
      })
    } else callback({ error: `No ship found by that ID.` })
  })
}
