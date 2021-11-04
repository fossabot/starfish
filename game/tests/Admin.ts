/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import fs from 'fs'

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

let adminKeys: any
try {
  adminKeys = fs
    .readFileSync(
      process.env.ADMIN_KEYS_FILE as string,
      `utf-8`,
    )
    .trim()
} catch (e) {
  try {
    adminKeys = fs
      .readFileSync(`/run/secrets/admin_keys`, `utf-8`)
      .trim()
  } catch (e) {
    adminKeys = ``
  }
}
try {
  adminKeys = JSON.parse(adminKeys)
} catch (e) {
  adminKeys = false
  c.log(`red`, `Error loading admin keys!`, e)
}

describe(`Admin check`, () => {
  it(`should properly check to make sure someone running an admin command has the right creds`, async () => {
    const g = new Game()

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(`game:adminCheck`, `hi`, `hi`, (res) => {
        expect(res).to.equal(false)
        r()
      }),
    )

    await new Promise<void>((r) =>
      client.emit(
        `game:adminCheck`,
        `${adminKeys.allowedIds[0]}`,
        adminKeys.password,
        (res) => {
          expect(res).to.equal(true)
          r()
        },
      ),
    )
  })
})

describe(`Admin resetters`, () => {
  it(`should properly remove all planets on wipe`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })

    for (let i = 0; i < 100; i++) {
      await g.addBasicPlanet(basicPlanetData())
    }

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `game:resetAllPlanets`,
        `${adminKeys.allowedIds[0]}`,
        adminKeys.password,
        async () => {
          expect(g.planets.length).to.equal(0)
          await c.sleep(200)
          expect(g.planets.length).to.equal(0)
          expect(
            await g.db?.planet.getAllConstructible,
          ).to.have.lengthOf(0)
          r()
        },
      ),
    )
  })

  it(`should properly remove all ships on wipe`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })

    for (let i = 0; i < 50; i++) {
      await g.addAIShip(aiShipData())
    }
    for (let i = 0; i < 50; i++) {
      await g.addHumanShip(humanShipData())
    }

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `game:resetAllShips`,
        `${adminKeys.allowedIds[0]}`,
        adminKeys.password,
        async () => {
          expect(g.ships.length).to.equal(0)
          await c.sleep(200)
          expect(g.ships.length).to.equal(0)
          expect(
            await g.db?.ship.getAllConstructible,
          ).to.have.lengthOf(0)
          r()
        },
      ),
    )
  })

  it(`should properly remove all ai ships on wipe`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })

    for (let i = 0; i < 100; i++) {
      await g.addAIShip(aiShipData())
    }

    const client = socketIoClient(
      `http://0.0.0.0:${g.ioPort}`,
      {
        secure: true,
      },
    )
    await awaitIOConnection(client)

    await new Promise<void>((r) =>
      client.emit(
        `game:resetAllAIShips`,
        `${adminKeys.allowedIds[0]}`,
        adminKeys.password,
        async () => {
          expect(g.ships.length).to.equal(0)
          expect(g.aiShips.length).to.equal(0)
          await c.sleep(200)
          expect(g.ships.length).to.equal(0)
          expect(
            await g.db?.ship.getAllConstructible,
          ).to.have.lengthOf(0)
          r()
        },
      ),
    )
  })
})
