/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import socketIoClient, {
  Socket as ClientSocket,
} from 'socket.io-client' // yes, we're making a CLIENT here.
import {
  awaitIOConnection,
  enemyAiShipData,
  basicPlanetData,
  crewMemberData,
  humanShipData,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'
import { BasicPlanet } from '../src/game/classes/Planet/BasicPlanet'

describe(`Contract basics`, () => {
  it(`should spawn contracts on planets`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.maxContracts = 1
    p.refreshContracts()

    expect(p.contracts.length).to.equal(1)
  })

  it(`should not spawn contracts on allied ships`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.incrementAllegiance(`fowl`, 100000)
    p.maxContracts = 1
    p.refreshContracts()

    expect(p.contracts.length).to.equal(0)
  })

  it(`should be able to accept contracts`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())
    const s = await g.addHumanShip(humanShipData())
    const cm = await s.addCrewMember(crewMemberData())
    s.guildId = `explorer`
    s.commonCredits = 999999
    s.shipCosmeticCurrency = 999999
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.incrementAllegiance(`explorer`, 100000)
    p.maxContracts = 1
    p.refreshContracts()

    s.updateVisible()
    s.updatePlanet()
    expect(s.planet).to.not.be.false

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    expect(p.contracts.length).to.equal(1)
    const planetContract = p.contracts[0]

    await new Promise<void>((r) =>
      client.emit(
        `ship:acceptContract`,
        s.id,
        cm.id,
        planetContract?.id,
        (res) => {
          expect(res.error).to.be.undefined
          expect(s.contracts.length).to.equal(1)
          expect(p.contracts.length).to.equal(0)
          expect(s.contracts[0].id).to.equal(
            planetContract?.id,
          )
          r()
        },
      ),
    )
  })

  it(`should steal contracts on target ship dying by another's hand`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())
    const s = await g.addHumanShip(humanShipData())
    const cm = await s.addCrewMember(crewMemberData())
    s.guildId = `explorer`
    s.commonCredits = 999999
    s.shipCosmeticCurrency = 999999
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.incrementAllegiance(`explorer`, 100000)
    p.maxContracts = 1
    p.refreshContracts()

    s.updateVisible()
    s.updatePlanet()
    expect(s.planet).to.not.be.false

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    expect(p.contracts.length).to.equal(1)
    const planetContract = p.contracts[0]

    await new Promise<void>((r) =>
      client.emit(
        `ship:acceptContract`,
        s.id,
        cm.id,
        planetContract?.id,
        (res) => {
          r()
        },
      ),
    )

    s.move([999, 999])
    s.updatePlanet()

    await ai.die()
    expect(s.contracts[0]?.status).to.equal(`stolen`)
  })

  it(`should time out contracts`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.maxContracts = 1
    p.refreshContracts()
    expect(p.contracts.length).to.equal(1)
    const planetContract = p.contracts[0]
    planetContract.timeAllowed = 10

    const s = await g.addHumanShip(humanShipData())
    const cm = await s.addCrewMember(crewMemberData())
    s.commonCredits = 999999
    s.shipCosmeticCurrency = 999999
    s.updateVisible()
    s.updatePlanet()
    expect(s.planet).to.not.be.false

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `ship:acceptContract`,
        s.id,
        cm.id,
        planetContract?.id,
        (res) => {
          r()
        },
      ),
    )
    await c.sleep(11)
    s.checkContractTimeOuts()

    expect(s.contracts.length).to.equal(0)
  })

  it(`should flag contracts as done on target ship dying by contractor's hand`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())

    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.maxContracts = 1
    p.refreshContracts()
    expect(p.contracts.length).to.equal(1)
    const planetContract = p.contracts[0]

    const s = await g.addHumanShip(
      humanShipData(`testMega`),
    )
    const cm = await s.addCrewMember(crewMemberData())
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    s.updateVisible()
    s.recalculateCombatTactic()
    s.guildId = `explorer`
    s.commonCredits = 999999
    s.shipCosmeticCurrency = 999999
    s.updatePlanet()
    expect(s.planet).to.not.be.false

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `ship:acceptContract`,
        s.id,
        cm.id,
        planetContract?.id,
        (res) => {
          r()
        },
      ),
    )

    s.move([
      s.location[0] + g.settings.arrivalThreshold + 0.001,
      s.location[1],
    ])
    ai.move([...s.location])
    s.updatePlanet()
    s.recalculateCombatTactic()
    expect(s.planet).to.be.false
    expect(s.targetShip).to.equal(ai)
    expect(s.getEnemiesInAttackRange()?.[0]).to.equal(ai)
    expect(s.weapons.length).to.be.greaterThan(0)

    s.weapons.forEach((w) => (w.cooldownRemaining = 0))
    s.autoAttack(999)
    while (!ai.dead) {
      s.weapons.forEach((w) => (w.cooldownRemaining = 0))
      s.autoAttack(999)
    }
    expect(s.contracts[0]?.status).to.equal(`done`)
  })

  it(`should complete done contracts on returning to a planet`, async () => {
    const g = new Game()
    const ai = await g.addAIShip(enemyAiShipData())

    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.maxContracts = 1
    p.refreshContracts()
    expect(p.contracts.length).to.equal(1)
    const planetContract = p.contracts[0]

    const s = await g.addHumanShip(
      humanShipData(`testMega`),
    )
    const cm = await s.addCrewMember(crewMemberData())
    s.commonCredits = 999999
    s.shipCosmeticCurrency = 999999
    s.updatePlanet()

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `ship:acceptContract`,
        s.id,
        cm.id,
        planetContract?.id,
        (res) => {
          r()
        },
      ),
    )

    s.move([
      s.location[0] + g.settings.arrivalThreshold + 0.001,
      s.location[1],
    ])
    s.updatePlanet()
    s.contracts[0].reward.shipCosmeticCurrency = 100
    const previous = s.shipCosmeticCurrency
    s.contracts[0].status = `done`
    s.move([...p.location])
    s.updatePlanet()

    expect(s.contracts.length).to.equal(0)
    expect(s.shipCosmeticCurrency).to.equal(previous + 100)
  })
})
