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

      crewMemberBaseData.name =
        crewMemberBaseData.name.substring(
          0,
          c.maxNameLength,
        )
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
      `Set ${crewMember.name} on ${ship.name} location to ${target}.`,
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
        `Set ${crewMember.name} on ${ship.name} targetLocation to ${targetLocation}.`,
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
      `Set ${crewMember.name} on ${ship.name} tactic to ${tactic}.`,
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
        `Set ${crewMember.name} on ${ship.name} attack target to ${targetShip?.name}.`,
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
        `Set ${crewMember.name} on ${ship.name} repair priority to ${repairPriority}.`,
      )
    },
  )

  socket.on(`crew:contribute`, (shipId, crewId, amount) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return
    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember) return

    if (amount > crewMember.credits) return

    crewMember.credits -= amount
    ship.addCommonCredits(amount, crewMember)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} contributed ${amount} to the common fund.`,
    )
  })

  socket.on(
    `crew:buyCargo`,
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

      const planet = ship.game.planets.find(
        (p) => p.name === vendorLocation,
      )
      const cargoForSale = planet?.vendor?.cargo?.find(
        (cfs) =>
          cfs.cargoData.type === cargoType &&
          cfs.buyMultiplier,
      )
      if (!planet || !cargoForSale)
        return callback({
          error: `That cargo is not for sale here.`,
        })

      if (
        crewMember.heldWeight + amount >
        crewMember.maxCargoWeight
      )
        return callback({
          error: `That's too heavy to fit into your cargo space.`,
        })

      const price = c.r2(
        cargoForSale.cargoData.basePrice *
          cargoForSale.buyMultiplier *
          amount *
          planet?.buyFluctuator *
          (planet.faction === ship.faction
            ? c.factionVendorMultiplier
            : 1),
        5,
      )
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
        `${crewMember.name} on ${ship.name} bought ${amount} ${cargoType} from ${vendorLocation}.`,
      )
    },
  )

  socket.on(
    `crew:sellCargo`,
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

      const planet = ship.game.planets.find(
        (p) => p.name === vendorLocation,
      )
      const cargoBeingBought = planet?.vendor?.cargo?.find(
        (cbb) =>
          cbb.cargoData.type === cargoType &&
          cbb.sellMultiplier,
      )
      if (!planet || !cargoBeingBought)
        return callback({
          error: `The vendor does not buy that.`,
        })

      const price = c.r2(
        cargoBeingBought.cargoData.basePrice *
          cargoBeingBought.sellMultiplier *
          amount *
          planet.sellFluctuator *
          (planet.faction === ship.faction
            ? 1 + (1 - (c.factionVendorMultiplier || 1))
            : 1),
        5,
      )

      crewMember.credits += price
      existingStock.amount -= amount
      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} sold ${amount} ${cargoType} to ${vendorLocation}.`,
      )
    },
  )

  socket.on(
    `crew:drop`,
    (
      shipId,
      crewId,
      cargoType,
      amount,
      message,
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

      if (cargoType === `credits`) {
        if (crewMember.credits < amount)
          return callback({
            error: `Not enough credits found.`,
          })
        crewMember.credits -= amount
      } else {
        const existingStock = crewMember.inventory.find(
          (cargo) => cargo.type === cargoType,
        )
        if (!existingStock || existingStock.amount < amount)
          return callback({
            error: `Not enough stock of that cargo found.`,
          })
        existingStock.amount -= amount
      }

      const cache = game.addCache({
        location: [...ship.location],
        contents: [{ type: cargoType, amount }],
        droppedBy: ship.id,
        message: c.sanitize(message).result,
      })

      ship.logEntry(
        `${
          crewMember.name
        } dropped a cache containing ${amount}${
          cargoType === `credits` ? `` : ` tons of`
        } ${cargoType}.`,
      )

      callback({
        data: c.stubify(cache),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} dropped ${amount} ${cargoType}.`,
      )
    },
  )

  socket.on(
    `crew:buyRepair`,
    (shipId, crewId, hp, vendorLocation, callback) => {
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

      const planet = ship.game.planets.find(
        (p) => p.name === vendorLocation,
      )
      const repairMultiplier = planet?.repairCostMultiplier
      if (!planet || !repairMultiplier)
        return callback({
          error: `This planet does not offer mechanics.`,
        })

      const price = c.r2(
        repairMultiplier *
          c.baseRepairCost *
          hp *
          planet.buyFluctuator *
          (planet.faction === ship.faction
            ? c.factionVendorMultiplier
            : 1),
        5,
      )
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price

      let remainingHp = hp
      while (true) {
        const prev = remainingHp
        remainingHp -= crewMember.repairAction(remainingHp)
        if (prev === remainingHp) break
      }

      ship.logEntry(
        `${crewMember.name} bought ${
          Math.round(hp * 100) / 100
        } hp worth of repairs.`,
        `medium`,
      )
      crewMember.addStat(
        `totalContributedToCommonFund`,
        price,
      )

      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought ${hp} hp of repairs from ${vendorLocation}.`,
      )
    },
  )

  socket.on(
    `crew:buyPassive`,
    (
      shipId,
      crewId,
      passiveType,
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

      const planet = ship.game.planets.find(
        (p) => p.name === vendorLocation,
      )
      const passiveForSale = planet?.vendor?.passives?.find(
        (pfs) =>
          pfs.passiveData?.type === passiveType &&
          pfs.buyMultiplier,
      )
      if (
        !planet ||
        !passiveForSale ||
        !passiveForSale.passiveData
      )
        return callback({
          error: `That passive is not for sale here.`,
        })

      const currentLevel =
        crewMember.passives.find(
          (p) => p.type === passiveType,
        )?.level || 0
      const price = c.r2(
        passiveForSale.passiveData.basePrice *
          passiveForSale.buyMultiplier *
          c.getCrewPassivePriceMultiplier(currentLevel) *
          planet.buyFluctuator *
          (planet.faction === ship.faction
            ? c.factionVendorMultiplier
            : 1),
        5,
        true,
      )
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      crewMember.addPassive(passiveForSale.passiveData)

      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought passive ${passiveType} from ${vendorLocation}.`,
      )
    },
  )
}
