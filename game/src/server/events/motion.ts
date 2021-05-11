import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import { stubify } from '../io'
import { Ship } from '../../game/classes/Ship/Ship'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on('ship:targetLocation', (id, targetLocation) => {
    if (
      !Array.isArray(targetLocation) ||
      targetLocation.length !== 2 ||
      targetLocation.find((l: any) => isNaN(parseInt(l)))
    )
      return c.log(
        'Invalid call to set targetLocation:',
        id,
        targetLocation,
      )
    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) foundShip.targetLocation = targetLocation
    c.log('Set', id, 'targetLocation to', targetLocation)
  })
}
