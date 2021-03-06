/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
import { humanShipData, enemyAiShipData } from './defaults'

describe(`Game`, () => {
  it(`should create a game with basic properties`, async () => {
    const game = new Game()
    expect(game).to.exist
    expect(game.settings).to.exist
    expect(game.io).to.exist
    expect(game.db).to.not.exist
  })

  it(`should expand the universe when humans are added`, async () => {
    const game = new Game()
    for (let i = 0; i < 20; i++) await game.addHumanShip(humanShipData())

    const prevUniverseSize = game.gameSoftRadius
    await game.addAIShip(enemyAiShipData())
    expect(game.gameSoftRadius).to.equal(prevUniverseSize)

    await game.addHumanShip(humanShipData())
    expect(game.gameSoftRadius).to.be.above(prevUniverseSize)
  })

  it(`should not shrink the universe when humans are removed`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    for (let i = 0; i < 20; i++) await g.addHumanShip(humanShipData())
    const prevUniverseSize = g.gameSoftRadius

    await g.removeShip(g.humanShips[0])
    expect(g.gameSoftRadius).to.equal(prevUniverseSize)

    await g.save()

    const g2 = new Game()
    await g2.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    expect(g2.minimumGameRadius).to.equal(prevUniverseSize)
    expect(g2.gameSoftRadius).to.equal(prevUniverseSize)
    await g.removeShip(g.humanShips[0])
    expect(g2.gameSoftRadius).to.equal(prevUniverseSize)
  })

  after(async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    await g.db?.ship.wipe()
    await g.db?.game.wipe()
  })
})
