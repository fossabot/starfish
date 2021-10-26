import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import type { Game } from '../../game/Game'
import type { HumanShip } from '../../game/classes/Ship/HumanShip/HumanShip'
import type { BasicPlanet } from '../../game/classes/Planet/BasicPlanet'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
  game: Game,
) {
  socket.on(
    `ship:buyTagline`,
    (shipId, crewId, tagline, callback) => {
      if (!game) return
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
          error: `Only the captain may buy cosmetics.`,
        })

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale =
        planet?.vendor?.shipCosmetics?.find(
          (i) => i.tagline === tagline,
        )
      if (!itemForSale)
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const price = Math.ceil(
        c.baseTaglinePrice *
          (itemForSale.priceMultiplier ?? 1),
      )
      if (price > ship.shipCosmeticCurrency)
        return callback({ error: `Insufficient funds.` })

      ship.shipCosmeticCurrency -= price
      ship.toUpdate.shipCosmeticCurrency =
        ship.shipCosmeticCurrency

      ship.addTagline(tagline, null, true)
      ship.boughtTaglines.push(tagline)
      ship.logEntry(
        [
          `Bought a new ship tagline for 💎${price}:`,
          { text: `"${tagline}"`, color: `var(--success)` },
        ],
        `high`,
      )

      callback({
        data: true,
      })

      planet.addXp(price)
      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the tagline: ${tagline}`,
      )
    },
  )

  socket.on(
    `ship:buyHeaderBackground`,
    (shipId, crewId, headerBackground, callback) => {
      if (!game) return
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
          error: `Only the captain may buy cosmetics.`,
        })

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale =
        planet?.vendor?.shipCosmetics?.find(
          (i) =>
            i.headerBackground &&
            i.headerBackground.id === headerBackground.id &&
            i.headerBackground.url === headerBackground.url,
        )
      if (!itemForSale)
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const price = Math.ceil(
        c.baseHeaderBackgroundPrice *
          (itemForSale.priceMultiplier ?? 1),
      )
      if (price > ship.shipCosmeticCurrency)
        return callback({ error: `Insufficient funds.` })

      ship.shipCosmeticCurrency -= price
      ship.toUpdate.shipCosmeticCurrency =
        ship.shipCosmeticCurrency

      ship.addHeaderBackground(headerBackground, null, true)
      ship.boughtHeaderBackgrounds.push(headerBackground)
      ship.logEntry(
        [
          `Bought a new ship header for 💎${price}:`,
          {
            text: `"${headerBackground.id}"`,
            color: `var(--success)`,
          },
        ],
        `high`,
      )

      callback({
        data: true,
      })

      planet.addXp(price)
      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the header background: ${headerBackground.id}`,
      )
    },
  )
}
