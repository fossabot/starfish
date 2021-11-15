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
import { awaitIOConnection } from './defaults'

const game = new Game()

describe(`IO setup`, () => {
  it(`should have an io object on the game that is properly linked`, async () => {
    expect(game.io).to.exist
  })

  it(`should should be able to be connected to from a local client`, async () => {
    const client = socketIoClient(
      `http://0.0.0.0:${game.ioPort}`,
      {
        secure: true,
      },
    )

    const didConnect = await awaitIOConnection(client)

    expect(didConnect).to.be.true
  })

  it(`should respond to a hello`, async () => {
    const client = socketIoClient(
      `http://0.0.0.0:${game.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(`hello`, (res) => {
        expect(!(`error` in res) && res.data).to.equal(
          `hello`,
        )
        r()
      }),
    )
  })
})
