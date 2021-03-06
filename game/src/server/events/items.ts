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
    `ship:buyItem`,
    (shipId, crewId, itemType, itemId, callback) => {
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
          error: `Only the captain may buy or sell equipment.`,
        })

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale = planet?.vendor?.items?.find(
        (i) =>
          i.type === itemType &&
          i.id === itemId &&
          i.buyMultiplier,
      )
      if (!itemForSale || !itemForSale.buyMultiplier)
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const price = c.getItemBuyPrice(
        itemForSale,
        planet,
        ship.guildId,
        crewMember.charisma.level,
      )
      if (ship.slots <= ship.items.length)
        return callback({
          error: `No slot available to attach any more equipment.`,
        })

      const buyRes = ship.buy(price, crewMember)
      if (buyRes !== true)
        return callback({ error: buyRes })

      ship.addItem({ itemType: itemType, itemId: itemId })
      ship.logEntry(
        [
          {
            text: (c.items[itemForSale.type] as any)[
              itemForSale.id
            ]!.displayName,
            tooltipData: (c.items[itemForSale.type] as any)[
              itemForSale.id
            ],
            color: `var(--item)`,
          },
          `bought for ${c.priceToString(price)}.`,
        ],
        `critical`,
        `sellItem`,
        true,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.addXp((price.credits || 0) / 100)
      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.credits || 0) / 100,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the ${itemType} of id ${itemId}.`,
      )
    },
  )

  socket.on(
    `ship:sellItem`,
    (shipId, crewId, id, callback) => {
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
          error: `Only the captain may buy or sell equipment.`,
        })

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })

      const heldItem = ship.items.find((i) => i.id === id)
      if (!heldItem)
        return callback({
          error: `Your ship doesn't have that item equipped.`,
        })

      const itemData = (c.items[heldItem.itemType] as any)[
        heldItem.itemId
      ]
      if (!itemData)
        return callback({
          error: `No item found by that id.`,
        })

      const price = c.getItemSellPrice(
        heldItem.itemType,
        heldItem.itemId,
        planet,
        ship.guildId,
        heldItem.level,
        crewMember.charisma.level,
      )

      ship.commonCredits += price
      ship._stub = null
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.removeItem(heldItem)

      ship.logEntry(
        [
          {
            text: heldItem.displayName,
            color: `var(--item)`,
            tooltipData: heldItem.toReference() as any,
          },
          `sold for ????${c.numberWithCommas(
            c.r2(price, 0),
          )}.`,
        ],
        `high`,
        `sellItem`,
        true,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price || 0) / 100,
        )

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} sold the ship's ${heldItem.itemType} of id ${heldItem.itemId}.`,
      )
    },
  )

  socket.on(
    `ship:swapChassis`,
    (shipId, crewId, chassisId, callback) => {
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
          error: `Only the captain may buy or sell equipment.`,
        })

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })
      const itemForSale = planet?.vendor?.chassis?.find(
        (i) => i.id === chassisId,
      )
      if (
        !itemForSale ||
        !itemForSale.buyMultiplier ||
        !c.items.chassis[itemForSale.id]
      )
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const price = c.getChassisSwapPrice(
        itemForSale,
        planet,
        ship.chassis.chassisId,
        ship.guildId,
        crewMember.charisma.level,
      )

      if (
        ship.items.length >
        c.items.chassis[itemForSale.id]?.slots
      )
        return callback({
          error: `Your equipment wouldn't all fit! Sell some equipment first, then swap chassis.`,
        })

      const buyRes = ship.buy(price, crewMember)
      if (buyRes !== true)
        return callback({ error: buyRes })

      ship.swapChassis(c.items.chassis[itemForSale.id])
      ship.logEntry(
        [
          {
            text: c.items.chassis[itemForSale.id]!
              .displayName,
            tooltipData: c.items.chassis[itemForSale.id],
            color: `var(--item)`,
          },
          `bought for ${c.priceToString(price)}.`,
        ],
        `critical`,
        `sellItem`,
        true,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      if (ship.guildId)
        planet.incrementAllegiance(
          ship.guildId,
          (price.credits || 0) / 100,
        )
      planet.addXp((price.credits || 0) / 100)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} swapped to the chassis ${chassisId}.`,
      )
    },
  )
}
