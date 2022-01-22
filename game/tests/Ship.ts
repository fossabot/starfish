/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import { basicPlanetData, crewMemberData, humanShipData } from './defaults'

describe(`Ship vision`, () => {
  it(`should be able to see another ship within range`, async () => {
    let g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    g.chunkManager.resetCache() // happens on tick
    ship.updateVisible()
    ship2.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(ship2.id)
    expect(ship2.visible.ships.map((s) => s.id)).to.include(ship.id)
  })

  it(`should be able to see a planet within range`, async () => {
    let g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let planet = await g.addBasicPlanet(basicPlanetData())
    g.chunkManager.resetCache() // happens on tick
    ship.updateVisible()
    expect(ship.visible.planets.map((s) => s.id)).to.include(planet.id)
  })

  it(`should not be able to see another ship outside of vision range`, async () => {
    let g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    g.chunkManager.resetCache() // happens on tick
    ship.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(ship2.id)

    ship2.move([10 + ship.radii.sight - 0.00001, 0])
    g.chunkManager.resetCache() // happens on tick
    ship.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(ship2.id)

    ship2.move([10 + ship.radii.sight + 0.00001, 0])
    g.chunkManager.resetCache() // happens on tick
    ship.updateVisible()
    expect(ship.visible.ships.length).to.equal(0)
  })
})
