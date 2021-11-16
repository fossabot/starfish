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
          error: `That is not for sale here.`,
        })

      const price: Price =
        c.getShipTaglinePrice(itemForSale)

      const buyRes = ship.buy(price, crewMember)
      if (buyRes !== true)
        return callback({ error: buyRes })

      ship.addTagline(tagline, null, true)
      ship.boughtTaglines.push(tagline)
      ship.logEntry(
        [
          `Bought tagline:`,
          { text: `"${tagline}"`, color: `var(--success)` },
        ],
        `high`,
        `party`,
        true,
      )

      callback({
        data: true,
      })

      planet.addXp(price.shipCosmeticCurrency || 0)
      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.shipCosmeticCurrency || 0) * 10,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the tagline: ${tagline}`,
      )
    },
  )

  socket.on(
    `ship:buyBackground`,
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
          error: `That is not for sale here.`,
        })

      const price: Price =
        c.getShipBackgroundPrice(itemForSale)

      const buyRes = ship.buy(price, crewMember)
      if (buyRes !== true)
        return callback({ error: buyRes })

      ship.addHeaderBackground(headerBackground, null, true)
      ship.boughtHeaderBackgrounds.push(headerBackground)
      ship.logEntry(
        [
          `Bought banner:`,
          {
            text: `"${headerBackground.id}"`,
            color: `var(--success)`,
          },
        ],
        `high`,
        `party`,
        true,
      )

      callback({
        data: true,
      })

      planet.addXp(price.shipCosmeticCurrency || 0)
      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.shipCosmeticCurrency || 0) * 10,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the header background: ${headerBackground.id}`,
      )
    },
  )

  socket.on(
    `crew:buyTagline`,
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

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale =
        planet?.vendor?.crewCosmetics?.find(
          (i) => i.tagline === tagline,
        )
      if (!itemForSale)
        return callback({
          error: `That is not for sale here.`,
        })

      const price: Price =
        c.getCrewTaglinePrice(itemForSale)

      const buyRes = crewMember.buy(price)
      if (buyRes !== true)
        return callback({ error: buyRes })

      crewMember.addTagline(tagline)

      callback({
        data: true,
      })

      planet.addXp((price.crewCosmeticCurrency || 0) / 1000)
      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.crewCosmeticCurrency || 0) / 100,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the tagline: ${tagline}`,
      )
    },
  )

  socket.on(
    `crew:buyBackground`,
    (shipId, crewId, background, callback) => {
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

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale =
        planet?.vendor?.crewCosmetics?.find(
          (i) =>
            i.background &&
            i.background.id === background.id &&
            i.background.url === background.url,
        )
      if (!itemForSale)
        return callback({
          error: `That is not for sale here.`,
        })

      const price: Price =
        c.getCrewBackgroundPrice(itemForSale)

      const buyRes = crewMember.buy(price)
      if (buyRes !== true)
        return callback({ error: buyRes })

      crewMember.addBackground(background)

      callback({
        data: true,
      })

      planet.addXp((price.crewCosmeticCurrency || 0) / 1000)
      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.crewCosmeticCurrency || 0) / 100,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the header background: ${background.id}`,
      )
    },
  )
}
