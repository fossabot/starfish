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
      crewMember.toUpdate.targetLocation =
        crewMember.targetLocation
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
    crewMember.toUpdate.tactic = crewMember.tactic
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
      crewMember.toUpdate.attackTarget =
        crewMember.attackTarget
      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} attack target to ${targetShip?.name}.`,
      )
    },
  )

  socket.on(
    `crew:itemTarget`,
    (shipId, crewId, targetId) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return

      crewMember.itemTarget = targetId
      crewMember.toUpdate.itemTarget = crewMember.itemTarget
      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} item target to ${targetId}.`,
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
      crewMember.toUpdate.repairPriority =
        crewMember.repairPriority
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

    amount = c.r2(amount, 2, true)

    if (amount > crewMember.credits) return

    crewMember.credits -= amount
    crewMember.toUpdate.credits = crewMember.credits
    ship.addCommonCredits(amount, crewMember)

    c.log(
      `gray`,
      `${crewMember.name} on ${ship.name} contributed ${amount} to the common fund.`,
    )
  })

  socket.on(
    `ship:redistribute`,
    (shipId, crewId, amount) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return
      if (ship.captain !== crewMember.id) return

      amount = c.r2(amount, 2, true)

      if (amount > ship.commonCredits) return

      ship.commonCredits -= amount
      ship.toUpdate.commonCredits = ship.commonCredits
      ship.logEntry(
        `The captain dispersed ${c.r2(
          amount,
        )} credits from the common fund amongst the crew.`,
      )
      ship.distributeCargoAmongCrew([
        { amount: amount, type: `credits` },
      ])

      c.log(
        `gray`,
        `The captain on ${ship.name} redistributed ${amount} from the common fund.`,
      )
    },
  )

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

      amount = c.r2(amount, 2, true)

      if (
        crewMember.heldWeight + amount >
        Math.min(
          ship.chassis.maxCargoSpace,
          crewMember.maxCargoSpace,
        )
      )
        return callback({
          error: `That's too heavy to fit into your cargo space.`,
        })

      const price = c.r2(
        cargoForSale.cargoData.basePrice *
          cargoForSale.buyMultiplier *
          amount *
          planet?.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1),
        2,
        true,
      )
      c.log({ price, credits: crewMember.credits })
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      crewMember.toUpdate.credits = crewMember.credits
      crewMember.addCargo(cargoType, amount)

      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      planet.incrementAllegiance(ship.faction)

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

      amount = c.r2(amount, 2)

      const existingStock = crewMember.inventory.find(
        (cargo) => cargo.type === cargoType,
      )
      if (!existingStock || existingStock.amount < amount)
        return callback({
          error: `Not holding enough stock of that cargo.`,
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
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? 1 + (1 - (c.factionVendorMultiplier || 1))
            : 1),
        2,
        true,
      )

      crewMember.credits += price
      crewMember.toUpdate.credits = crewMember.credits
      crewMember.removeCargo(cargoType, amount)
      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      planet.incrementAllegiance(ship.faction)

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

      amount = c.r2(amount, 2, true)

      if (cargoType === `credits`) {
        if (crewMember.credits < amount)
          return callback({
            error: `Not enough credits found.`,
          })
        crewMember.credits -= amount
        crewMember.toUpdate.credits = crewMember.credits
      } else {
        const existingStock = crewMember.inventory.find(
          (cargo) => cargo.type === cargoType,
        )
        if (!existingStock || existingStock.amount < amount)
          return callback({
            error: `Not enough stock of that cargo found.`,
          })
        existingStock.amount -= amount
        crewMember.toUpdate.inventory = crewMember.inventory
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
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1),
        2,
        true,
      )
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      crewMember.toUpdate.credits = crewMember.credits

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

      planet.incrementAllegiance(ship.faction)

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
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) => a.faction.id === ship.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1),
        2,
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

      planet.incrementAllegiance(ship.faction)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought passive ${passiveType} from ${vendorLocation}.`,
      )
    },
  )

  socket.on(
    `crew:thrust`,
    (shipId, crewId, chargePercent, callback) => {
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

      const targetLocation: CoordinatePair | null =
        crewMember.targetLocation
      if (!targetLocation)
        return callback({
          error: `You're not targeting any location to thrust towards!`,
        })

      ship.applyThrust(
        targetLocation,
        chargePercent,
        crewMember,
      )

      crewMember._stub = null
      ship._stub = null
      callback({
        data: {
          crewMember: crewMember.stubify(),
          ship: ship.stubify(),
        },
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} thrusted.`,
      )
    },
  )

  socket.on(
    `crew:brake`,
    (shipId, crewId, chargePercent, callback) => {
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

      ship.brake(chargePercent, crewMember)

      crewMember._stub = null
      ship._stub = null
      callback({
        data: {
          crewMember: crewMember.stubify(),
          ship: ship.stubify(),
        },
      })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} thrusted.`,
      )
    },
  )
}
