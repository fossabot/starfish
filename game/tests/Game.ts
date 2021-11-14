/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import { humanShipData, aiShipData } from './defaults'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

const game = new Game()

describe(`Game`, () => {
  beforeEach(async () => {
    await game.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
  })
  it(`should create a game with basic properties`, async () => {
    const g = new Game()
    expect(g).to.exist
    expect(g.settings).to.exist
    expect(g.io).to.exist
    expect(g.db).to.not.exist
  })

  it(`should expand the universe when humans are added`, async () => {
    for (let i = 0; i < 20; i++)
      await game.addHumanShip(humanShipData())

    const prevUniverseSize = game.gameSoftRadius
    await game.addAIShip(aiShipData())
    expect(game.gameSoftRadius).to.equal(prevUniverseSize)

    await game.addHumanShip(humanShipData())
    expect(game.gameSoftRadius).to.be.above(
      prevUniverseSize,
    )
  })

  it(`should not shrink the universe when humans are removed`, async () => {
    for (let i = 0; i < 20; i++)
      await game.addHumanShip(humanShipData())
    const prevUniverseSize = game.gameSoftRadius

    await game.removeShip(game.humanShips[0])
    expect(game.gameSoftRadius).to.equal(prevUniverseSize)

    await game.save()

    const g2 = new Game()
    await g2.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    expect(g2.minimumGameRadius).to.equal(prevUniverseSize)
    expect(g2.gameSoftRadius).to.equal(prevUniverseSize)
    await game.removeShip(game.humanShips[0])
    expect(g2.gameSoftRadius).to.equal(prevUniverseSize)
  })

  after(async () => {
    await game.db?.ship.wipe()
    await game.db?.game.wipe()
  })
})
