import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { Ship } from '../../game/classes/Ship/Ship'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'

// ----- online count -----
const connectedIds: { id: string; lastSeen: number }[] = []
const idConnected = (id: string) => {
  const found = connectedIds.find((e) => e.id === id)
  if (!found) {
    connectedIds.push({ id, lastSeen: Date.now() })
    game.activePlayers++
  } else found.lastSeen = Date.now()
}
const clearInactive = () => {
  const now = Date.now()
  connectedIds.forEach((e) => {
    if (now - e.lastSeen > c.userIsOfflineTimeout)
      connectedIds.splice(connectedIds.indexOf(e), 1)
  })
  game.activePlayers = connectedIds.length
}
setInterval(clearInactive, 20 * 1000)

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
        guildName:
          (foundShip as HumanShip).guildName ||
          foundShip.name,
        guildIcon: (foundShip as HumanShip).guildIcon,
        guildId: foundShip.guildId,
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
      if (crewMemberId) idConnected(crewMemberId)
      // c.log(
      //   `gray`,
      //   `Frontend client started watching ship ${id} io`,
      // )
    } else
      callback({ error: `No ship found by the ID ${id}.` })

    socket.join([`ship:${id}`])
  })

  socket.on(`user:listen`, (userId) => {
    socket.join([`user:${userId}`])
    idConnected(userId)
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
    `ship:joinGuild`,
    (shipId, crewId, guildId, callback) => {
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
          error: `Only the captain may change the ship's guild.`,
        })
      if (!c.guilds[guildId])
        return callback({
          error: `Invalid guild.`,
        })

      const price = c.getGuildChangePrice(ship as any)
      if (ship.commonCredits < price)
        return callback({
          error: `Not enough common credits.`,
        })

      ship.commonCredits = Math.round(
        ship.commonCredits - price,
      )
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.changeGuild(guildId)

      const stub = ship.stubify() as ShipStub
      callback({
        data: stub,
      })
    },
  )

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

  socket.on(
    `ship:orders`,
    (shipId, crewId, orders, callback) => {
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
          error: `Only the captain may change the ship orders.`,
        })

      // reset salutes
      ship.orderReactions = []
      ship.toUpdate.orderReactions = ship.orderReactions

      if (!orders) {
        ship.orders = false
        ship.toUpdate.orders = false
        callback({ data: false })
      } else {
        const prevOrders = ship.orders
        if (
          prevOrders &&
          prevOrders?.verb === orders.verb &&
          prevOrders?.target?.id === orders.target?.id &&
          prevOrders?.target?.type ===
            orders.target?.type &&
          prevOrders?.addendum === orders.addendum
        )
          return

        ship.orders = orders
        ship.toUpdate.orders = orders
        callback({ data: true })

        // don't log if it's mostly the same
        if (
          prevOrders &&
          prevOrders?.verb === orders.verb &&
          prevOrders?.target?.type ===
            orders.target?.type &&
          prevOrders?.target?.id === orders.target?.id
        )
          return

        const captain = ship.crewMembers.find(
          (cm) => cm.id === ship.captain,
        )
        if (captain) {
          const logEntry: LogContent = [
            `New orders from captain ${captain.name}: "${orders.verb}`,
          ]
          if (orders.target)
            logEntry.push({
              text: orders.target.name
                ? orders.target.name
                : orders.target.type === `cache`
                ? `that cache`
                : [
                    `weapon`,
                    `armor`,
                    `engine`,
                    `communicator`,
                    `scanner`,
                  ].includes(orders.target.type as any)
                ? c.items[orders.target.type as ItemType][
                    orders.target.id as ItemId
                  ].displayName
                : orders.target.id,
              tooltipData: [
                `weapon`,
                `armor`,
                `engine`,
                `communicator`,
                `scanner`,
              ].includes(orders.target.type as any)
                ? ship.items
                    .find(
                      (i) =>
                        i.type === orders.target?.type &&
                        i.id === orders.target.id,
                    )
                    ?.toReference()
                : (orders.target as any),
              color:
                orders.target.type === `planet`
                  ? game.planets.find(
                      (p) => p.name === orders.target!.name,
                    )?.color
                  : orders.target.type === `zone`
                  ? game.zones.find(
                      (p) => p.id === orders.target!.id,
                    )?.color
                  : orders.target.type === `ship`
                  ? ship.visible.ships.find(
                      (s) => s.id === orders.target!.id,
                    )?.guildId
                    ? c.guilds[
                        ship.visible.ships.find(
                          (s) => s.id === orders.target!.id,
                        )?.guildId as any
                      ].color
                    : undefined
                  : orders.target.type === `cache`
                  ? `var(--cache)`
                  : `var(--item)`,
            })
          if (!orders.addendum) logEntry.push(`&nospace!`)
          else logEntry.push(`&nospace${orders.addendum}`)
          logEntry.push(`&nospace"`)

          ship.logEntry(logEntry, `high`)
        }
        /*

        "<span>{{ validOrders.verb }}</span
        ><span
          class="nowrap"
          v-if="validOrders.target"
          v-tooltip="validOrders.target"
          :style="{ color: validOrders.target.color }"
        >
          {{ validOrders.target.icon || ''
          }}{{
            validOrders.target.name ||
            validOrders.target.displayName
          }}</span
        ><span v-if="validOrders.addendum">{{
          validOrders.addendum
        }}</span
        ><span v-else>!</span>"
        */
      }

      c.log(
        `gray`,
        `${ship.name} orders ${
          orders ? `set` : `cleared`
        }.`,
      )
    },
  )
}
