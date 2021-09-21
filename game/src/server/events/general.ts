import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { Ship } from '../../game/classes/Ship/Ship'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`hello`, () => {
    c.log(`hello received`)
  })

  socket.on(
    `ships:forUser:fromIdArray`,
    (shipIds, userId, callback) => {
      // c.log(`ships:forUser:fromIdArray`, shipIds, userId)
      const foundShips = game.ships.filter(
        (s) =>
          s.human &&
          !s.tutorial &&
          shipIds.includes(s.id) &&
          s.crewMembers.find((cm) => cm.id === userId),
      )
      if (foundShips.length) {
        const shipsAsStubs = foundShips.map((s) =>
          c.stubify<Ship, ShipStub>(s),
        )
        callback({
          data: shipsAsStubs,
        })
      } else callback({ data: [] })
    },
  )

  socket.on(`ship:get`, (id, callback) => {
    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) {
      const stub = c.stubify<Ship, ShipStub>(foundShip)
      callback({
        data: stub,
      })
    } else
      callback({ error: `No ship found by the ID ${id}.` })
  })
}
