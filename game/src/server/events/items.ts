import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import * as allItemData from '../../game/presets/items'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(
    `ship:buyItem`,
    (shipId, crewId, itemType, itemId, callback) => {
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

      const planet = ship.planet
      if (!planet)
        return callback({ error: `Not at a planet.` })
      const itemForSale = planet?.vendor?.items?.find(
        (i) =>
          i.itemType === itemType &&
          i.itemId === itemId &&
          i.buyMultiplier,
      )
      if (!itemForSale || !itemForSale.buyMultiplier)
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const price = c.r2(
        (itemForSale.itemData?.basePrice || 1) *
          itemForSale.buyMultiplier *
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1),
        0,
        true,
      )
      if (price > ship.commonCredits)
        return callback({ error: `Insufficient funds.` })

      if (ship.slots <= ship.items.length)
        return callback({
          error: `No slot available to attach any more equipment.`,
        })

      ship.commonCredits -= price
      ship._stub = null
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.addItem({ type: itemType, id: itemId })
      ship.logEntry(
        `${
          itemForSale.itemData?.displayName
        } (${itemType}) bought by the captain for ${c.r2(
          price,
        )} credits.`,
        `high`,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.incrementAllegiance(ship.faction)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought the ${itemType} of id ${itemId}.`,
      )
    },
  )

  socket.on(
    `ship:sellItem`,
    (shipId, crewId, itemType, itemId, callback) => {
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

      const planet = ship.planet
      if (!planet)
        return callback({ error: `Not at a planet.` })

      const heldItem = ship.items.find(
        (i) => i.type === itemType && i.id === itemId,
      )
      if (!heldItem)
        return callback({
          error: `Your ship doesn't have that item equipped.`,
        })

      const itemForSale = planet?.vendor?.items?.find(
        (i) =>
          i.itemType === itemType &&
          i.itemId === itemId &&
          i.sellMultiplier,
      )

      const itemData = (allItemData[itemType] as any)[
        itemId
      ]
      if (!itemData)
        return callback({
          error: `No item found by that id.`,
        })

      const price = c.r2(
        (itemData?.basePrice || 1) *
          (itemForSale?.sellMultiplier ||
            c.baseItemSellMultiplier) *
          planet.priceFluctuator *
          (planet.faction === ship.faction
            ? 1 + (1 - c.factionVendorMultiplier)
            : 1),
        0,
        true,
      )

      ship.commonCredits += price
      ship._stub = null
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.removeItem(heldItem)

      ship.logEntry(
        `${
          heldItem.displayName
        } (${itemType}) sold by the captain for ${c.r2(
          price,
        )} credits.`,
        `high`,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.incrementAllegiance(ship.faction)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} sold the ship's ${itemType} of id ${itemId}.`,
      )
    },
  )

  socket.on(
    `ship:swapChassis`,
    (shipId, crewId, chassisType, callback) => {
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

      const planet = ship.planet
      if (!planet)
        return callback({ error: `Not at a planet.` })
      const itemForSale = planet?.vendor?.chassis?.find(
        (i) => i.chassisType === chassisType,
      )
      if (
        !itemForSale ||
        !itemForSale.buyMultiplier ||
        !itemForSale.chassisData
      )
        return callback({
          error: `That equipment is not for sale here.`,
        })

      const currentChassisSellPrice = Math.round(
        ship.chassis.basePrice / 2,
      )
      const price = c.r2(
        (itemForSale.chassisData?.basePrice || 1) *
          itemForSale.buyMultiplier *
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1) -
          currentChassisSellPrice,
        0,
        true,
      )

      if (price > ship.commonCredits)
        return callback({ error: `Insufficient funds.` })

      if (
        ship.items.length > itemForSale.chassisData?.slots
      )
        return callback({
          error: `Your equipment wouldn't all fit! Sell some equipment first, then swap chassis.`,
        })

      ship.commonCredits -= price
      ship._stub = null
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.swapChassis(itemForSale.chassisData)
      ship.logEntry(
        `${
          itemForSale.chassisData?.displayName
        } (chassis) bought by the captain for ${c.r2(
          price,
        )} credits.`,
        `high`,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.incrementAllegiance(ship.faction)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} swapped to the chassis ${chassisType}.`,
      )
    },
  )
}
