import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { Ship } from '../../game/classes/Ship/Ship'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import type { CrewMember } from '../../game/classes/CrewMember/CrewMember'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  // socket.on(`god`, () => {
  //   socket.join([`game`])
  // })

  socket.on(`ship:basics`, (id, callback) => {
    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) {
      const stub = c.stubify({
        name: foundShip.name,
        id: foundShip.id,
        faction: foundShip.faction,
        species: foundShip.species,
        tagline: foundShip.tagline,
        headerBackground: foundShip.headerBackground,
      })
      callback({ data: stub })
    } else
      callback({
        error: `No ship basics found by the ID ${id}.`,
      })
  })

  socket.on(`ship:listen`, (id, crewMemberId, callback) => {
    if (!callback) {
      if (typeof crewMemberId === `function`) {
        ;(crewMemberId as any)({
          error: `Please refresh the page.`,
        })
      }
      return
    }
    let foundShip = game.ships.find((s) => s.id === id)

    if (foundShip && crewMemberId) {
      const crewMember = foundShip.crewMembers.find(
        (c) => c.id === crewMemberId,
      )
      // return crew member tutorial ship instead if it exists
      if (
        crewMember &&
        crewMember.tutorialShipId &&
        game.ships.find(
          (s) => s.id === crewMember.tutorialShipId,
        )
      ) {
        // c.log(
        //   `returning tutorial ship ${crewMember.tutorialShipId} instead of requested ship`,
        // )
        id = crewMember.tutorialShipId
        foundShip = game.ships.find((s) => s.id === id)
      } else delete crewMember?.tutorialShipId // just to clean up in case they have a reference to a missing tutorial ship
    }

    if (foundShip) {
      const stub: ShipStub = foundShip.stubify()
      // * clearing parts of visible here because they're not being properly obfuscated with a raw stubify call
      delete stub.visible
      callback({ data: stub })
      // c.log(
      //   `gray`,
      //   `Frontend client started watching ship ${id} io`,
      // )
    } else
      callback({ error: `No ship found by the ID ${id}.` })

    socket.join([`ship:${id}`])
  })

  socket.on(`ship:unlisten`, (id) => {
    c.log(
      `gray`,
      `Frontend client stopped watching ${id} io`,
    )
    socket.leave(`ship:${id}`)
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
    const stub = c.stubify<Ship, ShipStub>(foundShip)
    callback({
      data: stub,
    })
  })

  socket.on(`ship:advanceTutorial`, (id) => {
    const ship = game.ships.find(
      (s) => s.id === id,
    ) as HumanShip
    if (!ship)
      return c.log(
        `red`,
        `No ship found to advance tutorial for: ${id}`,
      )
    if (!ship.tutorial)
      return c.log(
        `red`,
        `Ship ${ship.name} (${ship.id}) is not in a tutorial, and thus cannot advance.`,
      )
    // c.log(`gray`, `Advancing tutorial for ship ${id}`)
    ship.tutorial.advanceStep()
  })

  socket.on(`ship:skipTutorial`, (id) => {
    const ship = game.ships.find(
      (s) => s.id === id,
    ) as HumanShip
    if (!ship)
      return c.log(
        `red`,
        `No ship found to skip tutorial for: ${id}`,
      )
    if (!ship.tutorial)
      return c.log(
        `red`,
        `Ship ${ship.name} (${ship.id}) is not in a tutorial, and thus cannot skip.`,
      )
    // c.log(`gray`, `Skipping tutorial for ship ${id}`)
    ship.tutorial.done(true)
  })

  socket.on(
    `ship:headerBackground`,
    (shipId, crewId, bgId, callback) => {
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
      if (ship.captain !== crewMember.id)
        return callback({
          error: `Only the captain may change the ship banner.`,
        })

      if (!ship.availableHeaderBackgrounds.includes(bgId))
        return callback({
          error: `You don't own that banner yet!`,
        })

      const found = c.headerBackgroundOptions.find(
        (b) => b.id === bgId,
      )
      if (!found)
        return callback({
          error: `Invalid banner id.`,
        })

      ship.headerBackground = found.url
      ship.toUpdate.headerBackground = found.url

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} swapped banner to ${bgId}.`,
      )

      callback({ data: `ok` })
    },
  )

  socket.on(
    `ship:tagline`,
    (shipId, crewId, tagline, callback) => {
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
      if (ship.captain !== crewMember.id)
        return callback({
          error: `Only the captain may change the ship tagline.`,
        })

      if (!tagline) {
        ship.tagline = null
        ship.toUpdate.tagline = null

        c.log(
          `gray`,
          `${crewMember.name} on ${ship.name} cleared their tagline.`,
        )
        callback({ data: `ok` })
        return
      }

      if (!ship.availableTaglines.includes(tagline))
        return callback({
          error: `You don't own that tagline yet!`,
        })

      const found = c.taglineOptions.find(
        (t) => t === tagline,
      )
      if (!found)
        return callback({
          error: `Invalid tagline.`,
        })

      ship.tagline = found
      ship.toUpdate.tagline = found

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} swapped tagline to ${tagline}.`,
      )

      callback({ data: `ok` })
    },
  )
}
