import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { Ship } from '../../game/classes/Ship/Ship'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`discord`, () => {
    c.log(`Discord process connected to io`)
    socket.join([`discord`])
  })

  socket.on(`ship:create`, (data, callback) => {
    const foundShip = game.ships.find(
      (s) => s.id === data.id,
    )
    if (foundShip) {
      c.log(
        `Call to create existing ship, returning existing`,
      )
      const stub = c.stubify<Ship, ShipStub>(foundShip)
      callback({
        data: stub,
      })
    } else {
      const ship = game.addHumanShip({
        ...data,
        loadout: `human_default`,
      })
      const stub = c.stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    }
  })
}
