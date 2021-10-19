/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import { Game } from '../src/game/Game'

import { crewMemberData, humanShipData } from './defaults'

let game: Game

describe(`DB setup`, () => {
  before(async () => {
    game = new Game()
    await game.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
  })

  it(`should be able to connect to the db from the game`, async () => {
    expect(game.db).to.exist
    const ships = await game.db?.ship.getAllConstructible()
    expect(ships).to.exist
    expect(ships?.length).to.equal(0)
  })

  it(`should be able to save a ship`, async () => {
    await game.addHumanShip(humanShipData())
    const ships = await game.db?.ship.getAllConstructible()
    expect(ships?.length).to.equal(1)
  })

  it(`should be able to load saved ships on new game start`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    const ships = await g.db?.ship.getAllConstructible()
    expect(ships?.length).to.equal(1)
  })

  it(`should be able to remove a ship`, async () => {
    await game.removeShip(game.ships[0].id)
    const ships = await game.db?.ship.getAllConstructible()
    expect(ships?.length).to.equal(0)
  })
})
