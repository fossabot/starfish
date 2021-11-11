/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import loadouts from '../src/game/presets/loadouts'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import {
  crewMemberData,
  humanShipData,
  basicPlanetData,
  aiShipData,
  awaitIOConnection,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'
import { Planet } from '../src/game/classes/Planet/Planet'
import { BasicPlanet } from '../src/game/classes/Planet/BasicPlanet'

import socketIoClient, {
  Socket as ClientSocket,
} from 'socket.io-client'

describe(`Planet basics`, () => {
  it(`should be able to create a Planet`, async () => {
    const p = new BasicPlanet(basicPlanetData())
    expect(p).to.be.an.instanceof(Planet)
    expect(p).to.be.an.instanceof(BasicPlanet)

    const g = new Game()
    const p2 = await g.addBasicPlanet(basicPlanetData())
    expect(p2).to.be.an.instanceof(Planet)
    expect(p2).to.be.an.instanceof(BasicPlanet)
    expect(g.planets.length).to.equal(1)
  })
})

describe(`Planet prices`, () => {
  it(`should have better prices for allies than for normal ships`, async () => {
    const g = new Game()
    const p2 = await g.addBasicPlanet(basicPlanetData())

    const itemPrice: PlanetVendorItemPrice = {
      type: `armor`,
      buyMultiplier: 1,
      id: `block1`,
    }
    p2.vendor.items.push(itemPrice)
    p2.incrementAllegiance(`explorer`, 100000)
    const nonAlliedPrice = c.getItemBuyPrice(itemPrice, p2)
    const alliedPrice = c.getItemBuyPrice(
      itemPrice,
      p2,
      `explorer`,
    )
    expect(alliedPrice.credits || 0).to.be.below(
      nonAlliedPrice.credits || 0,
    )
  })
})

describe(`Planet levels`, () => {
  it(`should be able to add xp to a planet`, async () => {
    const p = new BasicPlanet(basicPlanetData())
    await c.sleep(15)
    await p.addXp(100)
    expect(p.xp).to.equal(100)
  })

  it(`should level up when it reaches the next xp breakpoint`, async () => {
    let p = new BasicPlanet(basicPlanetData())
    await c.sleep(15)
    expect(p.level).to.equal(1)
    expect(p.xp).to.equal(0)

    const nextLevelXpThreshold =
      c.levels[p.level] *
      c.planetLevelXpRequirementMultiplier
    await p.addXp(nextLevelXpThreshold - p.xp - 1)
    expect(p.xp).to.equal(nextLevelXpThreshold - 1)
    expect(p.level).to.equal(1)

    await p.addXp(1)
    expect(p.level).to.equal(2)

    p = new BasicPlanet(basicPlanetData())
    await c.sleep(15)
    await p.addXp(
      c.levels[p.level + 2] *
        c.planetLevelXpRequirementMultiplier -
        1,
    )
    expect(p.level).to.equal(3)
    await p.addXp(1)
    expect(p.level).to.equal(4)
  })

  it(`should add xp correctly on credit donation`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet

    const s = await g.addHumanShip(humanShipData())
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    cm.credits = 1000

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `crew:donateToPlanet`,
        s.id,
        cm.id,
        1,
        (res) => {
          expect(res.error).to.be.undefined
          r()
        },
      ),
    )
    expect(cm.credits).to.equal(999)
    expect(p.xp).to.equal(1 / c.planetContributeCostPerXp)
  })

  it(`should add xp correctly on crew cosmetic donation`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet

    const s = await g.addHumanShip(humanShipData())
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    cm.crewCosmeticCurrency = 1000

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `crew:donateCosmeticCurrencyToPlanet`,
        s.id,
        cm.id,
        1,
        (res) => {
          expect(res.error).to.be.undefined
          r()
        },
      ),
    )
    expect(cm.crewCosmeticCurrency).to.equal(999)
    expect(p.xp).to.equal(
      1 / c.planetContributeCrewCosmeticCostPerXp,
    )
  })

  it(`should add xp correctly on ship cosmetic donation`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet

    const s = await g.addHumanShip(humanShipData())
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    s.shipCosmeticCurrency = 1000

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `ship:donateCosmeticCurrencyToPlanet`,
        s.id,
        cm.id,
        1,
        (res) => {
          expect(res.error).to.be.undefined
          r()
        },
      ),
    )
    expect(s.shipCosmeticCurrency).to.equal(999)
    expect(p.xp).to.equal(
      1 / c.planetContributeShipCosmeticCostPerXp,
    )
  })

  // it(`should add something when it levels up`, async () => {})
})

describe(`Planet orbital defense`, () => {
  it(`should attack a ship in range when it sees an attack remnant`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addHumanShip(humanShipData())

    const res = p.defend(true)
    expect(res).to.not.exist

    s.updateVisible()
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    s.recalculateCombatTactic()
    s.autoAttack(999)

    const res2 = p.defend(true)
    expect(res2).to.exist
  })

  it(`should not attack a human ship that has attacked an ai ship`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addAIShip(aiShipData())

    s.updateVisible()
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    s.recalculateCombatTactic()
    s.autoAttack(999)

    const res = p.defend(true)
    expect(res?.target.id).to.equal(s2.id)
  })

  it(`should attack an ai ship that has attacked a human ship`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addAIShip(aiShipData())

    s2.updateVisible()
    s2.attack(s, s2.weapons[0])

    const res = p.defend(true)
    expect(res?.target.id).to.equal(s2.id)
  })

  it(`should attack alongside an allied ship`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]
    p.incrementAllegiance(`explorer`, 100000)

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addHumanShip(humanShipData())
    s2.guildId = `explorer`

    s2.updateVisible()
    s2.attack(s, s2.weapons[0])

    const res = p.defend(true)
    expect(res?.target.id).to.equal(s.id)
  })

  it(`should defend an attacked allied ship`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]
    p.incrementAllegiance(`explorer`, 100000)

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addHumanShip(humanShipData())
    s.guildId = `explorer`

    s2.updateVisible()
    s2.attack(s, s2.weapons[0])

    const res = p.defend(true)
    expect(res?.target.id).to.equal(s2.id)
  })

  it(`should not engage in a fight between allied ships`, async () => {
    const g = new Game()
    const p = (await g.addBasicPlanet(
      basicPlanetData(),
    )) as BasicPlanet
    p.defense = 100
    p.location = [10.5, 0]
    p.incrementAllegiance(`explorer`, 100000)
    p.incrementAllegiance(`hunter`, 100000)

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addHumanShip(humanShipData())
    s.guildId = `explorer`
    s2.guildId = `hunter`

    s2.updateVisible()
    s2.attack(s, s2.weapons[0])

    const res = p.defend(true)
    expect(res).to.be.undefined
  })
})
