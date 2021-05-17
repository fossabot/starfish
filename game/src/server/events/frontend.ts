import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'
import { CombatShip } from '../../game/classes/Ship/CombatShip'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on('god', () => {
    socket.join(['game'])
  })

  socket.on('ship:listen', (id, callback) => {
    c.log(`Frontend client started watching ship ${id} io`)
    socket.join([`ship:${id}`])

    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) {
      const stub = stubify<CombatShip, ShipStub>(
        foundShip as CombatShip,
      )
      callback({ data: stub })
    } else callback({ error: `No ship found by that ID.` })
  })

  socket.on('ship:unlisten', (id) => {
    c.log(
      'gray',
      `Frontend client stopped watching ${id} io`,
    )
    socket.leave(`ship:${id}`)
  })
}
