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
      if (game.humanShips.length >= c.gameShipLimit) {
        callback({
          error: `There are already the maximum number of ships in the game! Please check back later or ask in the support server when more space will be opening up. Priority goes to supporters!`,
        })
        return
      }

      data.name = data.name.substring(0, c.maxNameLength)
      if (process.env.NODE_ENV !== `development`)
        data.tutorial = { step: -1 }
      const ship = game.addHumanShip({
        ...data,
      })
      const stub = c.stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    }
  })

  socket.on(`ship:destroy`, (shipId, callback) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })

    game.removeShip(ship)
    callback({ data: `Removed your ship from the game.` })
  })

  socket.on(
    `ship:broadcast`,
    (shipId, crewId, message, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({ error: `No ship found.` })
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({ error: `No crew member found.` })
      const broadcastRes = ship.broadcast(
        message,
        crewMember,
      )
      callback({ data: broadcastRes })
    },
  )

  socket.on(
    `ship:setCaptain`,
    (shipId, crewId, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({ error: `No ship found.` })
      const crewMember = ship.crewMembers.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({ error: `No crew member found.` })
      ship.captain = crewMember.id
      callback({ data: `ok` })
    },
  )

  socket.on(
    `ship:kickMember`,
    (shipId, crewId, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({ error: `No ship found.` })
      const crewMember = ship.crewMembers.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({ error: `No crew member found.` })

      if (ship.captain === crewMember.id)
        ship.captain = null

      ship.removeCrewMember(crewMember.id)
      callback({ data: `ok` })
    },
  )

  socket.on(`crew:rename`, (shipId, crewId, newName) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship)
      return c.log(
        `Attempted to rename a user from a ship that did not exist. (${crewId} on ship ${shipId})`,
      )
    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember)
      return c.log(
        `Attempted to rename a user that did not exist. (${crewId} on ship ${shipId})`,
      )

    crewMember.rename(newName)
  })

  socket.on(`ship:rename`, (shipId, newName, callback) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship)
      return c.log(
        `Attempted to rename a ship that did not exist. (ship ${shipId})`,
      )

    ship.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    ship.toUpdate.name = ship.name

    callback({ data: ship.name })
  })

  socket.on(
    `ship:alertLevel`,
    (shipId, newLevel, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return c.log(
          `Attempted to change alert level of a ship that did not exist. (${shipId})`,
        )

      ship.logAlertLevel = newLevel
      callback({ data: ship.logAlertLevel })
    },
  )
}
