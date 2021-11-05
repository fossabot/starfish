import c from '../../../../../../common/dist'

import type { HumanShip } from './HumanShip'
import type { BasicPlanet } from '../../Planet/BasicPlanet'

export function startContract(
  this: HumanShip,
  contractId: string,
): IOResponse<Contract> {
  const planet = this.planet
  if (!planet)
    return {
      error: `You need to be on a planet to start a contract.`,
    }
  if (planet.planetType !== `basic`)
    return {
      error: `You need to be on a normal planet to start a contract.`,
    }
  const planetContract = (
    planet as BasicPlanet
  ).contracts.find(
    (co) => co.id === contractId && co.targetId !== this.id,
  )
  if (!planetContract)
    return {
      error: `No claimable contract found by that ID.`,
    }

  if (this.contracts.find((co) => co.id === contractId))
    return {
      error: `You already have that contract.`,
    }

  const buyRes = this.buy(planetContract.claimCost)
  if (buyRes !== true)
    return {
      error: `You cannot afford to claim this contract!`,
    }
  ;(planet as BasicPlanet).contracts?.splice(
    (planet as BasicPlanet).contracts.indexOf(
      planetContract,
    ),
    1,
  )
  planet.updateFrontendForShipsAt()

  const target = this.game?.ships.find(
    (s) => s.id === planetContract.targetId,
  )
  if (!target) {
    return { error: `Could not find target.` }
  }

  this.buy(planetContract.claimCost)

  const contractData: Contract = {
    ...planetContract,
    timeAccepted: Date.now(),
    fromPlanetId: planet.id,
    status: `active`,
    claimableExpiresAt: undefined,
    lastSeenLocation: [...target.location],
  }
  this.contracts.push(contractData)
  this.toUpdate.contracts = this.contracts
  return { data: contractData }
}

export function stolenContract(
  this: HumanShip,
  co: Contract,
) {
  const contract = this.contracts.find(
    (con) => con.id === co.id,
  )
  if (!contract) return
  contract.status = `stolen`
  this.toUpdate.contracts = this.contracts

  const target = this.game?.ships.find(
    (s) => s.id === contract.targetId,
  )
  const planet = this.game?.planets.find(
    (p) => p.id === contract.fromPlanetId,
  )
  if (target)
    this.logEntry([
      `Contract to eliminate`,
      {
        text: target.name,
        color: target.guildId
          ? c.guilds[target.guildId].color
          : undefined,
        tooltipData: target.toReference(),
      },
      `has been completed, but not by you! Return to`,
      planet
        ? {
            text: planet.name,
            color: planet.color,
            tooltipData: planet.toReference(),
          }
        : `the contract's starting planet`,
      `to claim half of your`,
      {
        text: `reward`,
        color: `var(--item)`,
        tooltipData: c.priceToString(contract.reward),
      },
      `.`,
    ])
}

export function completeContract(
  this: HumanShip,
  co: Contract,
) {
  const contract = this.contracts.find(
    (con) => con.id === co.id,
  )
  if (!contract) return
  contract.status = `done`
  this.toUpdate.contracts = this.contracts

  const target = this.game?.ships.find(
    (s) => s.id === contract.targetId,
  )
  const planet = this.game?.planets.find(
    (p) => p.id === contract.fromPlanetId,
  )
  if (target)
    this.logEntry([
      `Contract to eliminate`,
      {
        text: target.name,
        color: target.guildId
          ? c.guilds[target.guildId].color
          : undefined,
        tooltipData: target.toReference(),
      },
      `complete! Return to`,
      planet
        ? {
            text: planet.name,
            color: planet.color,
            tooltipData: planet.toReference(),
          }
        : `the contract's starting planet`,
      `to claim your`,
      {
        text: `reward`,
        color: `var(--item)`,
        tooltipData: c.priceToString(contract.reward),
      },
      `.`,
    ])
}

export function checkContractTimeOut(
  this: HumanShip,
  contract: Contract,
) {
  if (
    contract.status === `done` ||
    contract.status === `stolen`
  )
    return
  if (
    Date.now() - contract.timeAccepted <
    contract.timeAllowed
  )
    return
  const index = this.contracts.findIndex(
    (co) => co.id === contract.id,
  )
  if (index === -1) return
  this.contracts.splice(index, 1)
  this.toUpdate.contracts = this.contracts
  const target = this.game?.ships.find(
    (s) => s.id === contract.targetId,
  )
  if (target)
    this.logEntry([
      `Contract to eliminate`,
      {
        text: target.name,
        color: target.guildId
          ? c.guilds[target.guildId].color
          : undefined,
        tooltipData: target.toReference(),
      },
      `has expired.`,
    ])
}

export function abandonContract(
  this: HumanShip,
  contract: Contract,
) {
  const index = this.contracts.findIndex(
    (co) => co.id === contract.id,
  )
  if (index === -1) return
  this.contracts.splice(index, 1)
  this.toUpdate.contracts = this.contracts

  const target = this.game?.ships.find(
    (s) => s.id === contract.targetId,
  )
  if (target)
    this.logEntry([
      `Contract to eliminate`,
      {
        text: target.name,
        color: target.guildId
          ? c.guilds[target.guildId].color
          : undefined,
        tooltipData: target.toReference(),
      },
      `has been abandoned.`,
    ])
}

export function checkTurnInContract(
  this: HumanShip,
  contract: Contract,
) {
  if (
    !this.planet ||
    this.planet.id !== contract.fromPlanetId ||
    ![`done`, `stolen`].includes(contract.status)
  )
    return

  const index = this.contracts.findIndex(
    (co) => co.id === contract.id,
  )
  if (index === -1) return
  this.contracts.splice(index, 1)
  this.toUpdate.contracts = this.contracts

  this.addStat(`completedContracts`, 1)

  let reward = contract.reward
  if (contract.status === `stolen`) {
    reward = {
      credits: c.r2((contract.reward.credits || 0) / 2, 0),
      crewCosmeticCurrency: c.r2(
        (contract.reward.crewCosmeticCurrency || 0) / 2,
        0,
      ),
      shipCosmeticCurrency: c.r2(
        (contract.reward.shipCosmeticCurrency || 0) / 2,
        0,
      ),
    }
    this.logEntry(
      `Turning in a stolen contract for ${c.priceToString(
        reward,
      )}`,
    )
  } else if (contract.status === `done`) {
    this.logEntry(
      `Turning in a contract for ${c.priceToString(
        reward,
      )}`,
    )
  }

  this.distributeCargoAmongCrew([
    {
      id: `credits`,
      amount: c.r2(reward.credits || 0, 0),
    },
    {
      id: `crewCosmeticCurrency`,
      amount: c.r2(reward.crewCosmeticCurrency || 0, 0),
    },
    {
      id: `shipCosmeticCurrency`,
      amount: c.r2(reward.shipCosmeticCurrency || 0, 0),
    },
  ])

  c.log(`turning in contract`, contract.id)
}
