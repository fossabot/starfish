import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import type { CrewMember } from '../../game/classes/CrewMember/CrewMember'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(
    `crew:add`,
    (shipId, crewMemberBaseData, callback) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: `No ship found by that id.`,
        })

      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewMemberBaseData.id,
      )
      if (crewMember)
        return callback({
          error: `That crew member already exists on this ship.`,
        })

      const addedCrewMember = ship.addCrewMember(
        crewMemberBaseData,
      )
      const stub =
        c.stubify<CrewMember, CrewMemberStub>(
          addedCrewMember,
        )
      callback({ data: stub })
    },
  )

  socket.on(`crew:move`, (shipId, crewId, target) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return
    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember) return

    crewMember.goTo(target)
    c.log(
      `gray`,
      `Set ${crewMember.name} on ${ship.name} location to ${target}`,
    )
  })

  socket.on(
    `crew:targetLocation`,
    (shipId, crewId, targetLocation) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return

      if (
        !Array.isArray(targetLocation) ||
        targetLocation.length !== 2 ||
        targetLocation.find((l: any) => isNaN(parseInt(l)))
      )
        return c.log(
          `Invalid call to set crew targetLocation:`,
          shipId,
          crewId,
          targetLocation,
        )
      crewMember.targetLocation = targetLocation
      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} targetLocation to ${targetLocation}`,
      )
    },
  )

  socket.on(`crew:tactic`, (shipId, crewId, tactic) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return
    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember) return

    crewMember.tactic = tactic
    c.log(
      `gray`,
      `Set ${crewMember.name} on ${ship.name} tactic to ${tactic}`,
    )
  })

  socket.on(
    `crew:attackTarget`,
    (shipId, crewId, targetId) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return

      const targetShip =
        (game.ships.find(
          (s) => s.id === targetId,
        ) as CombatShip) || null

      crewMember.attackTarget = targetShip
      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} attack target to ${targetShip?.name}`,
      )
    },
  )

  socket.on(
    `crew:repairPriority`,
    (shipId, crewId, repairPriority) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return

      crewMember.repairPriority = repairPriority
      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} repair priority to ${repairPriority}`,
      )
    },
  )

  socket.on(
    `crew:buy`,
    (
      shipId,
      crewId,
      cargoType,
      amount,
      vendorLocation,
      callback,
    ) => {
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

      const cargoForSale = ship.game.planets
        .find((p) => p.name === vendorLocation)
        ?.vendor?.cargo?.find(
          (cfs) =>
            cfs.cargoData.type === cargoType &&
            cfs.buyMultiplier,
        )
      if (!cargoForSale)
        return callback({
          error: `That cargo is not for sale here.`,
        })

      const price =
        cargoForSale.cargoData.basePrice *
        cargoForSale.buyMultiplier *
        amount
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      const existingStock = crewMember.inventory.find(
        (cargo) => cargo.type === cargoType,
      )
      if (existingStock) existingStock.amount += amount
      else
        crewMember.inventory.push({
          type: cargoType,
          amount,
        })
      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought ${amount} ${cargoType} from ${vendorLocation}`,
      )
    },
  )

  socket.on(
    `crew:sell`,
    (
      shipId,
      crewId,
      cargoType,
      amount,
      vendorLocation,
      callback,
    ) => {
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

      const existingStock = crewMember.inventory.find(
        (cargo) => cargo.type === cargoType,
      )
      if (!existingStock || existingStock.amount < amount)
        return callback({
          error: `Not enough stock of that cargo found.`,
        })

      const cargoBeingBought = ship.game.planets
        .find((p) => p.name === vendorLocation)
        ?.vendor?.cargo?.find(
          (cbb) =>
            cbb.cargoData.type === cargoType &&
            cbb.sellMultiplier,
        )
      if (!cargoBeingBought)
        return callback({
          error: `The vendor does not buy that.`,
        })

      const price =
        cargoBeingBought.cargoData.basePrice *
        cargoBeingBought.sellMultiplier *
        amount

      crewMember.credits += price
      existingStock.amount -= amount
      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} sold ${amount} ${cargoType} to ${vendorLocation}`,
      )
    },
  )
}
