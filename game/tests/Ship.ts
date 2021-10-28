/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import loadouts from '../src/game/presets/loadouts'
import defaultGameSettings from '../src/game/presets/gameSettings'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import {
  basicPlanetData,
  crewMemberData,
  humanShipData,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'

describe(`Ship vision`, () => {
  it(`should be able to see another ship within range`, async () => {
    // created through game
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    let ship2 = await game.addHumanShip(humanShipData())
    ship.updateVisible()
    ship2.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(
      ship2.id,
    )
    expect(ship2.visible.ships.map((s) => s.id)).to.include(
      ship.id,
    )
  })

  it(`should be able to see a planet within range`, async () => {
    // created through game
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    let planet = await game.addBasicPlanet(
      basicPlanetData(),
    )
    ship.updateVisible()
    expect(
      ship.visible.planets.map((s) => s.id),
    ).to.include(planet.id)
  })

  it(`should not be able to see another ship outside of vision range`, async () => {
    // created through game
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    let ship2 = await game.addHumanShip(humanShipData())
    ship.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(
      ship2.id,
    )

    ship2.move([ship.radii.sight - 0.00001, 0])
    ship.updateVisible()
    expect(ship.visible.ships.map((s) => s.id)).to.include(
      ship2.id,
    )

    ship2.move([ship.radii.sight + 0.00001, 0])
    ship.updateVisible()
    expect(ship.visible.ships.length).to.equal(0)
  })
})