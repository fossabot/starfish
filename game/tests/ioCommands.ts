/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import socketIoClient, {
  Socket as ClientSocket,
} from 'socket.io-client' // yes, we're making a CLIENT here.

describe(`General commands`, () => {
  it(`should have an io object on the game that is properly linked`, async () => {
    const game = new Game()
    expect(game.io).to.exist
  })

  it(`should should be able to be connected to from a local client`, async () => {
    const game = new Game()
    const client = socketIoClient(
      `http://0.0.0.0:${game.ioPort}`,
      {
        secure: true,
      },
    )

    const didConnect = await awaitConnection(client)

    expect(didConnect).to.be.true
  })

  it(`should respond to a hello`, async () => {
    const game = new Game()
    const client = socketIoClient(
      `http://0.0.0.0:${game.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitConnection(client)

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

function awaitConnection(client: ClientSocket) {
  return new Promise<boolean>(async (r) => {
    if (client.connected) {
      r(true)
      return
    }
    let timeout = 0
    while (timeout < 500) {
      // 5 seconds
      await c.sleep(10)
      if (client.connected) {
        r(true)
        return
      }
      timeout++
    }
    r(false)
  })
}
