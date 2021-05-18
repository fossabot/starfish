import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'
import { CombatShip } from '../../game/classes/Ship/CombatShip'

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
      const stub = stubify<Ship, ShipStub>(foundShip)
      callback({
        data: stub,
      })
    } else {
      const ship = game.addHumanShip({
        ...data,
        loadout: `human_default`,
      })
      const stub = stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    }
  })

  socket.on(`ship:respawn`, (id, callback) => {
    const foundShip = game.ships.find(
      (s) => s.id === id,
    ) as CombatShip
    if (!foundShip) {
      callback({ error: `That ship doesn't exist yet!` })
      return
    }
    if (!foundShip.dead) {
      callback({ error: `That ship isn't dead!` })
      return
    }

    foundShip.respawn()
    const stub = stubify<Ship, ShipStub>(foundShip)
    callback({
      data: stub,
    })
  })
}
