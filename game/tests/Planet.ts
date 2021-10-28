import c from '../../common/src'
import loadouts from '../src/game/presets/loadouts'
import defaultGameSettings from '../src/game/presets/gameSettings'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import {
  crewMemberData,
  humanShipData,
  basicPlanetData,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'
import { Planet } from '../src/game/classes/Planet/Planet'
import { BasicPlanet } from '../src/game/classes/Planet/BasicPlanet'

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

  // it(`should add something when it levels up`, async () => {})
})