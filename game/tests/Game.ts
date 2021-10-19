/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

describe(`Game`, () => {
  it(`should create a game with basic properties`, async () => {
    let game = new Game()
    expect(game).to.exist
    expect(game.settings).to.exist
    expect(game.io).to.exist
    expect(game.db).to.not.exist
  })

  // todo test db connection
})
