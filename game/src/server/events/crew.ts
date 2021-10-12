import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import type { CrewMember } from '../../game/classes/CrewMember/CrewMember'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'
import type { Planet } from '../../game/classes/Planet/Planet'
import type { BasicPlanet } from '../../game/classes/Planet/BasicPlanet'
import { Tutorial } from '../../game/classes/Ship/addins/Tutorial'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(
    `crew:add`,
    async (shipId, crewMemberBaseData, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      crewMemberBaseData.credits = 1000
      crewMemberBaseData.cockpitCharge = 1
      const addedCrewMember = await ship.addCrewMember(
        crewMemberBaseData,
      )

      const stub = c.stubify<CrewMember, CrewMemberStub>(
        addedCrewMember,
      )
      callback({ data: stub })
    },
  )

  socket.on(`crew:toTutorial`, async (shipId, crewId) => {
    const ship = game.ships.find(
      (s) => s.id === shipId,
    ) as HumanShip
    if (!ship) return
    const crewMember = ship.crewMembers?.find(
      (cm) => cm.id === crewId,
    )
    if (!crewMember) return
    if (crewMember.tutorialShipId) return

    await Tutorial.putCrewMemberInTutorial(crewMember)

    socket.emit(
      `ship:forwardTo`,
      crewMember.tutorialShipId || ``,
    )
    c.log(
      `gray`,
      `Put ${crewMember.name} on ${ship.name} into the tutorial.`,
    )
  })

  socket.on(
    `crew:setSpecies`,
    async (shipId, crewId, speciesId, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: `No ship found by that id.`,
        })
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({
          error: `No crew member found by that id.`,
        })
      if (
        crewMember.speciesId &&
        c.species[crewMember.speciesId]
      )
        return callback({
          error: `That crew member already has a species.`,
        })
      if (!c.species[speciesId])
        return callback({
          error: `That species doesn't exist.`,
        })

      crewMember.setSpecies(speciesId)

      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name}'s species to ${crewMember.speciesId}.`,
      )
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
    (
      shipId,
      crewId,
      targetLocation,
      callback = () => {},
    ) => {
      if (typeof callback !== `function`)
        callback = () => {}
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: `No ship found by that id.`,
        })
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({
          error: `No crew member found by that id.`,
        })

      if (
        !Array.isArray(targetLocation) ||
        targetLocation.length !== 2 ||
        targetLocation.find((l: any) => isNaN(parseInt(l)))
      ) {
        c.log(
          `Invalid call to set crew targetLocation:`,
          shipId,
          crewId,
          targetLocation,
        )
        return callback({
          error: `Invalid target location.`,
        })
      }

      crewMember.targetLocation = targetLocation
      crewMember.toUpdate.targetLocation =
        crewMember.targetLocation

      callback({ data: crewMember.targetLocation })

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

    crewMember.combatTactic = tactic
    crewMember.toUpdate.combatTactic =
      crewMember.combatTactic

    ship.recalculateCombatTactic()

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

      let targetShip: CombatShip | undefined
      if (![`any`, `closest`].includes(targetId)) {
        targetShip =
          (game.ships.find(
            (s) => s.id === targetId,
          ) as CombatShip) || null
      }

      crewMember.attackTargetId = targetShip?.id || targetId // could also be 'any' or 'closest'
      crewMember.toUpdate.attackTargetId =
        crewMember.attackTargetId

      ship.determineTargetShip()

      c.log(
        `gray`,
        `Set ${crewMember.name} on ${
          ship.name
        } attack target to ${
          targetShip?.name || targetId
        }.`,
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

      crewMember.targetItemType = targetId || `any`
      crewMember.toUpdate.targetItemType =
        crewMember.targetItemType

      ship.recalculateTargetItemType()

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

  socket.on(
    `crew:minePriority`,
    (shipId, crewId, minePriority, callback?) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return (
          callback &&
          typeof callback === `function` &&
          callback({ error: `No ship found by that id.` })
        )
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return (
          callback &&
          typeof callback === `function` &&
          callback({
            error: `No crew member found by that id.`,
          })
        )
      if (
        minePriority !== `closest` &&
        !Object.keys(c.cargo).includes(minePriority)
      )
        return (
          callback &&
          typeof callback === `function` &&
          callback({ error: `Invalid mine priority.` })
        )

      crewMember.minePriority = minePriority
      crewMember.toUpdate.minePriority =
        crewMember.minePriority

      c.log(
        `gray`,
        `Set ${crewMember.name} on ${ship.name} mine priority to ${minePriority}.`,
      )

      return (
        callback &&
        typeof callback === `function` &&
        callback({ data: minePriority })
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
    `crew:donateToPlanet`,
    (shipId, crewId, amount, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship)
        return callback({
          error: `Couldn't find a ship by that id.`,
        })
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember)
        return callback({
          error: `Couldn't find a member by that id.`,
        })

      amount = c.r2(amount, 0, true)

      if (!amount || amount > crewMember.credits)
        return callback({
          error: `Insufficient credits.`,
        })

      const planet = ship.planet
      if (!planet)
        return callback({
          error: `It looks like you're not on a planet.`,
        })

      crewMember.credits -= amount
      crewMember.toUpdate.credits = crewMember.credits

      planet.donate(amount, ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} donated ${amount} credits to the planet ${planet.name}.`,
      )
    },
  )

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
        { amount: amount, id: `credits` },
      ])

      c.log(
        `gray`,
        `The captain on ${ship.name} redistributed ${amount} from the common fund.`,
      )
    },
  )

  socket.on(
    `crew:buyCargo`,
    (shipId, crewId, cargoId, amount, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      const planet = ship.planet

      if (!planet)
        return callback({
          error: `No planet found.`,
        })
      if (planet.planetType !== `basic`)
        return callback({
          error: `This planet can't buy anything!`,
        })

      const cargoForSale = (
        planet as BasicPlanet
      )?.vendor?.cargo?.find(
        (cfs) => cfs.id === cargoId && cfs.buyMultiplier,
      )
      if (!cargoForSale)
        return callback({
          error: `That cargo is not for sale here.`,
        })

      if (amount <= 0 || isNaN(parseFloat(`${amount}`)))
        return callback({ error: `Invalid amount.` })

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

      const price =
        c.getCargoBuyPrice(
          cargoId,
          planet as BasicPlanet,
          ship.guildId,
        ) * amount

      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits = Math.round(
        crewMember.credits - price,
      )
      crewMember.toUpdate.credits = crewMember.credits
      crewMember.addCargo(cargoId, amount)
      crewMember.addStat(`cargoTransactions`, 1)

      callback({ data: { cargoId, amount, price } })

      planet.addXp(price / 100)
      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought ${amount} ${cargoId} from ${planet.name}.`,
      )
    },
  )

  socket.on(
    `crew:sellCargo`,
    (shipId, crewId, cargoId, amount, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      if (amount <= 0 || isNaN(parseFloat(`${amount}`)))
        return callback({ error: `Invalid amount.` })

      amount = c.r2(amount, 2)

      const existingStock = crewMember.inventory.find(
        (cargo) => cargo.id === cargoId,
      )
      if (!existingStock || existingStock.amount < amount)
        return callback({
          error: `Not holding enough stock of that cargo.`,
        })

      const planet = ship.planet

      if (!planet)
        return callback({
          error: `No planet found.`,
        })
      if (
        planet.planetType !== `basic` ||
        !(planet as BasicPlanet).vendor?.cargo?.length
      )
        return callback({
          error: `This planet doesn't sell anything!`,
        })

      const price =
        c.getCargoSellPrice(
          cargoId,
          planet as BasicPlanet,
          ship.guildId,
        ) * amount

      crewMember.credits = Math.round(
        crewMember.credits + price,
      )
      crewMember.toUpdate.credits = crewMember.credits
      crewMember.removeCargo(cargoId, amount)
      crewMember.addStat(`cargoTransactions`, 1)

      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} sold ${amount} ${cargoId} to ${planet.name}.`,
      )

      callback({ data: { cargoId, amount, price } })
    },
  )

  socket.on(
    `crew:drop`,
    async (
      shipId,
      crewId,
      cargoId,
      amount,
      message,
      callback,
    ) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      if (cargoId === `credits`) {
        if (crewMember.credits < amount)
          return callback({
            error: `Not enough credits found.`,
          })
        crewMember.credits -= amount
        crewMember.toUpdate.credits = crewMember.credits
      } else {
        const existingStock = crewMember.inventory.find(
          (cargo) => cargo.id === cargoId,
        )
        if (!existingStock || existingStock.amount < amount)
          return callback({
            error: `Not enough stock of that cargo found.`,
          })
        existingStock.amount -= amount
        crewMember.toUpdate.inventory = crewMember.inventory
      }

      if (amount > 1) {
        const cache = await game.addCache({
          location: [...ship.location],
          contents: [{ id: cargoId, amount }],
          droppedBy: ship.id,
          message: c.sanitize(message).result,
        })

        ship.logEntry(
          `${
            crewMember.name
          } dropped a cache containing ${amount}${
            cargoId === `credits` ? `` : ` tons of`
          } ${cargoId}.`,
        )

        callback({
          data: cache.stubify(),
        })
      } else
        callback({
          data: undefined,
        })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} dropped ${amount} ${cargoId}.`,
      )
    },
  )

  socket.on(
    `crew:buyRepair`,
    (shipId, crewId, hp, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      const planet =
        ship.planet && ship.planet.planetType === `basic`
          ? (ship.planet as BasicPlanet)
          : null
      const repairMultiplier =
        planet?.vendor?.repairCostMultiplier
      if (!planet || !repairMultiplier)
        return callback({
          error: `This planet does not offer repair services.`,
        })

      const price = c.getRepairPrice(
        planet,
        hp,
        ship.guildId,
      )

      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      crewMember.toUpdate.credits = crewMember.credits

      ship.repair(hp)

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

      planet.addXp(price / 100)
      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought ${hp} hp of repairs from ${planet.name}.`,
      )
    },
  )

  socket.on(
    `crew:buyPassive`,
    (shipId, crewId, passiveId, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      const planet =
        ship.planet && ship.planet.planetType === `basic`
          ? (ship.planet as BasicPlanet)
          : null
      const passiveForSale = planet?.vendor?.passives?.find(
        (pfs) => pfs.id === passiveId && pfs.buyMultiplier,
      )

      if (
        !planet ||
        !passiveForSale ||
        !c.crewPassives[passiveForSale.id]
      )
        return callback({
          error: `That passive is not for sale here.`,
        })

      const currentIntensity =
        crewMember.getPassiveIntensity(passiveForSale.id)
      const price = c.getCrewPassivePrice(
        passiveForSale,
        currentIntensity,
        planet,
        ship.guildId,
      )
      if (price > crewMember.credits)
        return callback({ error: `Insufficient funds.` })

      crewMember.credits -= price
      crewMember.addToPermanentPassive({
        ...passiveForSale,
      })

      callback({
        data: c.stubify<CrewMember, CrewMemberStub>(
          crewMember,
        ),
      })

      planet.addXp(price / 100)
      if (ship.guildId)
        planet.incrementAllegiance(ship.guildId)

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} bought ${passiveForSale.intensity} ${passiveId} (passive) from ${planet.name}.`,
      )
    },
  )

  socket.on(
    `crew:thrust`,
    (shipId, crewId, chargePercent, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      const targetLocation: CoordinatePair | false =
        crewMember.targetLocation
      if (!targetLocation || !targetLocation.length)
        return callback({
          error: `You're not targeting any location to thrust towards!`,
        })

      const speedDifference = ship.applyThrust(
        targetLocation,
        chargePercent,
        crewMember,
      )

      callback({ data: speedDifference })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} thrusted.`,
      )
    },
  )

  socket.on(
    `crew:brake`,
    (shipId, crewId, chargePercent, callback) => {
      if (typeof callback !== `function`)
        callback = () => {}
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

      const brakeSpeed = ship.brake(
        chargePercent,
        crewMember,
      )

      callback({ data: brakeSpeed })

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} braked.`,
      )
    },
  )

  socket.on(
    `crew:reactToOrder`,
    (shipId, crewId, reaction) => {
      const ship = game.ships.find(
        (s) => s.id === shipId,
      ) as HumanShip
      if (!ship) return
      const crewMember = ship.crewMembers?.find(
        (cm) => cm.id === crewId,
      )
      if (!crewMember) return

      const existing = ship.orderReactions.find(
        (os) =>
          os.id === crewId && os.reaction === reaction,
      )
      if (existing)
        ship.orderReactions.splice(
          ship.orderReactions.indexOf(existing),
          1,
        )
      else
        ship.orderReactions.push({
          id: crewMember.id,
          reaction,
        })

      ship.toUpdate.orderReactions = ship.orderReactions

      c.log(
        `gray`,
        `${crewMember.name} on ${ship.name} reacted ${reaction} to an order.`,
      )
    },
  )
}
