import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import type { Game } from '../../game/Game'
import type { Ship } from '../../game/classes/Ship/Ship'
import type { HumanShip } from '../../game/classes/Ship/HumanShip/HumanShip'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
  game: Game,
) {
  socket.on(`discord`, () => {
    c.log(`Discord process connected to io`)
    socket.join([`discord`])
  })

  socket.on(`ship:create`, async (data, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
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
      if (
        game.humanShips.filter(
          (s) => !s.tutorial?.currentStep,
        ).length >= game.settings.humanShipLimit
      ) {
        callback({
          error: `There are already the maximum number of ships in the game! Please check back later or ask in the support server when more space will be opening up. Priority goes to supporters!`,
        })
        return
      }

      data.name =
        c.sanitize(data.name.substring(0, c.maxNameLength))
          .result || `ship`

      c.log(`Ship ${data.name} has joined the game.`)

      const ship = await game.addHumanShip({
        ...data,
      })
      const stub = c.stubify<Ship, ShipStub>(ship)
      callback({
        data: stub,
      })
    }
  })

  socket.on(`ship:destroy`, (shipId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
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
      if (!game) return
      if (typeof callback !== `function`)
        callback = () => {}
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
      if (ship.dead)
        return callback({ error: `Your ship is dead!` })

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
      if (!game) return
      if (typeof callback !== `function`)
        callback = () => {}
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

      ship.logEntry(
        [
          `${crewMember.name} has been promoted to captain!`,
        ],
        `critical`,
      )

      callback({ data: `ok` })
    },
  )

  socket.on(
    `ship:kickMember`,
    (shipId, crewId, callback) => {
      if (!game) return
      if (typeof callback !== `function`)
        callback = () => {}
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

      ship.removeCrewMember(crewMember.id)
      callback({ data: `ok` })
    },
  )

  socket.on(`crew:rename`, (shipId, crewId, newName) => {
    if (!game) return
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
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship)
      return c.log(
        `Attempted to rename a ship that did not exist. (ship ${shipId})`,
      )

    ship.rename(newName)

    callback({ data: ship.name })
  })

  socket.on(
    `ship:guildData`,
    (shipId, guildData, callback) => {
      if (!game) return
      if (typeof callback !== `function`)
        callback = () => {}
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: `no ship found to update guild data`,
        })

      ship.guildName = guildData.guildName
      ship.guildIcon = guildData.guildIcon

      callback({ data: true })
    },
  )

  socket.on(
    `ship:alertLevel`,
    (shipId, newLevel, callback) => {
      if (!game) return
      if (typeof callback !== `function`)
        callback = () => {}
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
