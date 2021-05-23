import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { Ship } from '../../game/classes/Ship/Ship'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`discord`, () => {
    c.log(`Discord process connected to io`)
    socket.join([`discord`])
  })

  socket.on(`ship:create`, (data, callback) => {
    const ship = game.ships.find((s) => s.id === data.id)
    if (ship) {
      c.log(
        `Call to create existing ship, returning existing.`,
      )
      const stub = c.stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    } else {
      data.name = data.name.substring(0, c.maxNameLength)
      const ship = game.addHumanShip({
        ...data,
      })
      const stub = c.stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    }
  })

  // socket.on(
  //   `ship:channelUpdate`,
  //   (guildId, channelType, channelId) => {
  //     const ship = game.ships.find(
  //       (s) => s.human && s.id === guildId,
  //     ) as HumanShip
  //     if (!ship)
  //       return c.log(
  //         `Attempted to set channel ${channelType} of nonexistant ship ${guildId}.`,
  //       )

  //     ship.setChannel(channelType, channelId)
  //     c.log(
  //       `Set channel ${channelType} on ship ${ship.name} to ${channelId}.`,
  //     )
  //   },
  // )
}
