/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

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
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'
import { Planet } from '../src/game/classes/Planet/Planet'
import { BasicPlanet } from '../src/game/classes/Planet/BasicPlanet'

import socketIoClient, {
  Socket as ClientSocket,
} from 'socket.io-client'

describe(`Attack remnant data`, () => {
  before(async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    await g.db?.attackRemnant.wipe()
  })

  let attackerId: string
  it(`should spawn an attack remnant`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })
    while (g.attackRemnants.length) g.attackRemnants.pop()

    const s = await g.addHumanShip(humanShipData())
    const s2 = await g.addHumanShip(humanShipData())

    s.updateVisible()
    await s.addCrewMember(crewMemberData())
    const cm = s.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    s.recalculateCombatTactic()
    s.autoAttack(999)
    attackerId = s.id

    expect(g.attackRemnants.length).to.equal(1)

    await c.sleep(400)
    const ars =
      await g.db?.attackRemnant.getAllConstructible()
    expect(ars?.length).to.equal(1)

    const ar = g.attackRemnants[0]
    expect(ar.attacker?.id).to.equal(s.id)
    expect(ar.defender?.id).to.equal(s2.id)
  })

  it(`should maintain attack remnant data through db save`, async () => {
    const g = new Game()
    await g.loadGameDataFromDb({
      dbName: `starfish-test`,
      username: `testuser`,
      password: `testpassword`,
    })

    expect(g.attackRemnants.length).to.equal(1)
    const ar = g.attackRemnants[0]
    expect(ar.attacker?.id).to.equal(attackerId)
    expect(ar.defender?.id).to.not.equal(attackerId)
  })
})
