import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import type { BasicPlanet } from '../../game/classes/Planet/BasicPlanet'

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

      const price = c.r2(
        ((c.items[itemForSale.type] as any)[itemForSale.id]
          .basePrice || 1) *
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
        [
          {
            text: (c.items[itemForSale.type] as any)[
              itemForSale.id
            ]!.displayName,
            tooltipData: (c.items[itemForSale.type] as any)[
              itemForSale.id
            ],
          },
          `bought by the captain for ${c.numberWithCommas(
            c.r2(price, 0),
          )} credits.`,
        ],
        `high`,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.addXp(price / 100)
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

      const planet = ship.planet as BasicPlanet
      if (!planet || planet.planetType !== `basic`)
        return callback({ error: `Not at a planet.` })

      const heldItem = ship.items.find(
        (i) => i.type === itemType && i.id === itemId,
      )
      if (!heldItem)
        return callback({
          error: `Your ship doesn't have that item equipped.`,
        })

      const itemData = (c.items[itemType] as any)[itemId]
      if (!itemData)
        return callback({
          error: `No item found by that id.`,
        })

      const price = c.r2(
        (itemData?.basePrice || 1) *
          c.baseItemSellMultiplier *
          planet.priceFluctuator *
          (planet.faction === ship.faction
            ? 1 + (1 - c.factionVendorMultiplier || 1)
            : 1),
        0,
        true,
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
            tooltipData: heldItem.toLogStub() as any,
          },
          `sold by the captain for ${c.numberWithCommas(
            c.r2(price, 0),
          )} credits.`,
        ],
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
    (shipId, crewId, chassisId, callback) => {
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

      const currentChassisSellPrice = Math.round(
        ship.chassis.basePrice * c.baseItemSellMultiplier,
      )
      const price = c.r2(
        (c.items.chassis[itemForSale.id]?.basePrice || 1) *
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
        ship.items.length >
        c.items.chassis[itemForSale.id]?.slots
      )
        return callback({
          error: `Your equipment wouldn't all fit! Sell some equipment first, then swap chassis.`,
        })

      ship.commonCredits -= price
      ship._stub = null
      ship.toUpdate.commonCredits = ship.commonCredits

      ship.swapChassis(c.items.chassis[itemForSale.id])
      ship.logEntry(
        [
          {
            text: c.items.chassis[itemForSale.id]!
              .displayName,
            tooltipData: c.items.chassis[itemForSale.id],
          },
          `bought by the captain for ${c.numberWithCommas(
            c.r2(price, 0),
          )} credits.`,
        ],
        `high`,
      )

      callback({
        data: c.stubify<HumanShip, ShipStub>(ship),
      })

      planet.incrementAllegiance(ship.faction)
      planet.addXp(price / 100)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} swapped to the chassis ${chassisId}.`,
      )
    },
  )
}
