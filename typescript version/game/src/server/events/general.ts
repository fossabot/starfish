import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
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
