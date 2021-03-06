import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import type { Game } from '../../game/Game'
import type { Ship } from '../../game/classes/Ship/Ship'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'
import type { HumanShip } from '../../game/classes/Ship/HumanShip/HumanShip'
import type { BasicPlanet } from '../../game/classes/Planet/BasicPlanet'

let localReferenceToGame: Game
// ----- online count -----
const connectedIds: { id: string; lastSeen: number }[] = []
function idConnected(id: string) {
  if (!localReferenceToGame) return
  const found = connectedIds.find((e) => e.id === id)
  if (!found) {
    connectedIds.push({ id, lastSeen: Date.now() })
    localReferenceToGame.activePlayers++
    // c.log(`new active player`, localReferenceToGame.activePlayers)
  } else found.lastSeen = Date.now()
}
function clearInactive() {
  if (!localReferenceToGame) return
  const now = Date.now()
  connectedIds.forEach((e) => {
    if (now - e.lastSeen > c.userIsOfflineTimeout) {
      connectedIds.splice(connectedIds.indexOf(e), 1)
      // c.log(`Removing active player`, e, connectedIds.length)
      localReferenceToGame.activePlayers = connectedIds.length
    }
  })
}
setInterval(clearInactive, 20 * 1000)

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
  game: Game,
) {
  localReferenceToGame = game

  socket.on(`ship:basics`, (id, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const foundShip = game.ships.find((s) => s.id === id)
    if (foundShip) {
      const stub = c.stubify({
        name: foundShip.name,
        id: foundShip.id,
        guildName: (foundShip as HumanShip).guildName || foundShip.name,
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
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    let foundShip = game.ships.find((s) => s.id === id)

    if (foundShip && crewMemberId) {
      const crewMember = foundShip.crewMembers.find(
        (c) => c.id === crewMemberId,
      )
      // return crew member tutorial ship instead if it exists
      if (
        crewMember &&
        crewMember.tutorialShipId &&
        game.ships.find((s) => s.id === crewMember.tutorialShipId)
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
    } else callback({ error: `No ship found by the ID ${id}.` })

    socket.join([`ship:${id}`])
  })

  socket.on(`user:listen`, (userId) => {
    if (!game) return
    socket.join([`user:${userId}`])
    idConnected(userId)
  })

  socket.on(`ship:respawn`, (id, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const foundShip = game.ships.find((s) => s.id === id) as CombatShip
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
    if (!game) return
    const ship = game.ships.find((s) => s.id === id) as HumanShip
    if (!ship)
      return c.log(`red`, `No ship found to advance tutorial for: ${id}`)
    if (!ship.tutorial)
      return c.log(
        `red`,
        `Ship ${ship.name} (${ship.id}) is not in a tutorial, and thus cannot advance.`,
      )
    // c.log(`gray`, `Advancing tutorial for ship ${id}`)
    ship.tutorial.advanceStep()
  })

  socket.on(`ship:skipTutorial`, (id) => {
    if (!game) return
    const ship = game.ships.find((s) => s.id === id) as HumanShip
    if (!ship) return c.log(`red`, `No ship found to skip tutorial for: ${id}`)
    if (!ship.tutorial)
      return c.log(
        `red`,
        `Ship ${ship.name} (${ship.id}) is not in a tutorial, and thus cannot skip.`,
      )
    // c.log(`gray`, `Skipping tutorial for ship ${id}`)
    ship.tutorial.done(true)
  })

  socket.on(`ship:joinGuild`, (shipId, crewId, guildId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may change the ship's guild.`,
      })
    if (!c.guilds[guildId])
      return callback({
        error: `Invalid guild.`,
      })

    const price = c.getGuildChangePrice(ship as any)

    const buyRes = ship.buy(price, crewMember)
    if (buyRes !== true) return callback({ error: buyRes })

    ship.changeGuild(guildId)

    const stub = ship.stubify() as ShipStub
    callback({
      data: stub,
    })
  })

  socket.on(`ship:headerBackground`, (shipId, crewId, bgId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may change the ship banner.`,
      })

    if (!ship.availableHeaderBackgrounds.find((a) => a.id === bgId))
      return callback({
        error: `You don't own that banner yet!`,
      })

    const found = ship.availableHeaderBackgrounds.find((b) => b.id === bgId)
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
  })

  socket.on(`ship:tagline`, (shipId, crewId, tagline, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may change the ship tagline.`,
      })

    if (!tagline) {
      ship.tagline = null
      ship.toUpdate.tagline = null

      c.log(`gray`, `${crewMember.name} on ${ship.name} cleared their tagline.`)
      callback({ data: `ok` })
      return
    }

    if (!ship.availableTaglines.includes(tagline))
      return callback({
        error: `You don't own that tagline yet!`,
      })

    ship.tagline = tagline
    ship.toUpdate.tagline = tagline

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} swapped tagline to ${tagline}.`,
    )

    callback({ data: `ok` })
  })

  socket.on(`captain:sendToBunk`, (shipId, crewId, targetCrewId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const captain = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!captain) return callback({ error: `No crew member found.` })
    if (ship.captain !== captain.id)
      return callback({
        error: `Only the captain may change the ship tagline.`,
      })

    const crewMember = ship.crewMembers?.find((cm) => cm.id === targetCrewId)
    if (!crewMember) return callback({ error: `No crew member found.` })

    crewMember.goTo(`bunk`, true)

    c.log(
      `gray`,
      `${captain.name} on ${ship.name} sent ${crewMember.name} to the bunk.`,
    )
    callback({ data: true })
  })

  socket.on(`ship:acceptContract`, (shipId, crewId, contractId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may take on contracts.`,
      })

    const contract = (ship.planet as BasicPlanet)?.contracts?.find(
      (co) => co.id === contractId,
    )
    if (!contract)
      return callback({
        error: `That contract is not available here.`,
      })

    const contractRes = ship.startContract(contract.id)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} accepted contract ${contract.id} at ${
        ship.planet ? ship.planet.name : `???`
      }.`,
    )

    callback(contractRes)
  })

  socket.on(`ship:abandonContract`, (shipId, crewId, contractId, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may abandon contracts.`,
      })

    const contract = ship.contracts.find((co) => co.id === contractId)
    if (!contract)
      return callback({
        error: `Contract not found.`,
      })

    ship.abandonContract(contract)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} abandoned contract ${contract.id}.`,
    )

    callback({ data: true })
  })

  socket.on(
    `ship:donateCosmeticCurrencyToPlanet`,
    (shipId, crewId, amount, callback) => {
      if (!game) return
      if (typeof callback !== `function`) callback = () => {}
      const ship = game.ships.find((s) => s.id === shipId) as HumanShip
      if (!ship)
        return callback({
          error: `Couldn't find a ship by that id.`,
        })
      const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
      if (!crewMember)
        return callback({
          error: `Couldn't find a member by that id.`,
        })
      if (crewMember.id !== ship.captain)
        return callback({
          error: `Only the captain can donate that currency.`,
        })

      amount = c.r2(amount, 0, true)

      if (!amount || amount > ship.shipCosmeticCurrency)
        return callback({
          error: `Insufficient ${c.shipCosmeticCurrencyPlural}.`,
        })

      const planet = ship.planet
      if (!planet)
        return callback({
          error: `It looks like you're not on a planet.`,
        })

      ship.shipCosmeticCurrency -= amount
      ship.toUpdate.shipCosmeticCurrency = ship.shipCosmeticCurrency

      planet.donate(
        amount / c.planetContributeShipCosmeticCostPerXp,
        ship.guildId,
      )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} donated ${amount} ${c.shipCosmeticCurrencyPlural} to the planet ${planet.name}.`,
      )

      return callback({ data: ship._stub })
    },
  )

  socket.on(`ship:deposit`, (shipId, crewId, amount, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may deposit currency in the bank.`,
      })
    const planet = ship.planet
    if (!planet)
      return callback({
        error: `You aren't on a planet!`,
      })
    if (
      !(planet as BasicPlanet).bank &&
      !ship.banked.find((b) => b.id === planet.id)
    )
      return callback({
        error: `This planet doesn't have a bank!`,
      })
    if (amount > ship.commonCredits)
      return callback({
        error: `You don't have that many ????${c.baseCurrencyPlural}!`,
      })
    if (amount < 0)
      return callback({
        error: `You can't deposit a negative amount!`,
      })
    if (amount === 0)
      return callback({
        error: `Ha ha, zero, nice one.`,
      })

    ship.depositInBank(amount)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} deposited ????${amount} ${c.baseCurrencyPlural} in the bank at ${planet.name}.`,
    )

    callback({ data: true })
  })

  socket.on(`ship:withdraw`, (shipId, crewId, amount, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
    if (ship.captain !== crewMember.id)
      return callback({
        error: `Only the captain may withdraw common ????${c.baseCurrencyPlural} from the bank.`,
      })
    const planet = ship.planet
    if (!planet)
      return callback({
        error: `You aren't on a planet!`,
      })
    if (
      !(planet as BasicPlanet).bank &&
      !ship.banked.find((b) => b.id === planet.id)
    )
      return callback({
        error: `This planet doesn't have a bank!`,
      })

    ship.withdrawFromBank(amount)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} withdrew ????${amount} ${c.baseCurrencyPlural} from the bank at ${planet.name}.`,
    )

    callback({ data: true })
  })

  socket.on(`ship:orders`, (shipId, crewId, orders, callback) => {
    if (!game) return
    if (typeof callback !== `function`) callback = () => {}
    const ship = game.ships.find((s) => s.id === shipId) as HumanShip
    if (!ship) return callback({ error: `No ship found.` })
    const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId)
    if (!crewMember) return callback({ error: `No crew member found.` })
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
        prevOrders?.target?.type === orders.target?.type &&
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
        prevOrders?.target?.type === orders.target?.type &&
        prevOrders?.target?.id === orders.target?.id
      )
        return

      const captain = ship.crewMembers.find((cm) => cm.id === ship.captain)
      if (captain) {
        const logEntry: LogContent = [`New orders: "${orders.verb}`]
        if (orders.target)
          logEntry.push({
            text:
              orders.target.speciesId && orders.target.name // ai ship, include emoji
                ? `${c.species[orders.target.speciesId]?.icon || ``}${
                    orders.target.name
                  }`
                : orders.target.name
                ? orders.target.name
                : orders.target.targetName
                ? orders.target.targetName
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
                      i.itemType === orders.target?.type &&
                      i.itemId === orders.target.id,
                  )
                  ?.toReference()
              : (orders.target as any),
            color:
              orders.target.type === `planet`
                ? game.planets.find((p) => p.name === orders.target!.name)
                    ?.color
                : orders.target.type === `zone`
                ? game.zones.find((p) => p.id === orders.target!.id)?.color
                : orders.target.type === `ship`
                ? ship.visible.ships.find((s) => s.id === orders.target!.id)
                    ?.guildId
                  ? c.guilds[
                      ship.visible.ships.find((s) => s.id === orders.target!.id)
                        ?.guildId as any
                    ]?.color
                  : undefined
                : orders.target.type === `contract`
                ? ship.contracts.find((s) => s.id === orders.target!.id)
                  ? c.guilds[
                      ship.contracts.find((s) => s.id === orders.target!.id)
                        ?.targetGuildId as any
                    ]?.color
                  : undefined
                : orders.target.type === `cache`
                ? `var(--cache)`
                : `var(--item)`,
          })
        if (!orders.addendum) logEntry.push(`&nospace!`)
        else logEntry.push(`&nospace${orders.addendum}`)
        logEntry.push(`&nospace"`)

        ship.logEntry(logEntry, `critical`, `speech`, true)
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

    c.log(`gray`, `${ship.name} orders ${orders ? `set` : `cleared`}.`)
  })
}
