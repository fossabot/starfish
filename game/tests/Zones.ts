/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import { zoneData, crewMemberData, humanShipData } from './defaults'

describe(`Zone effects`, () => {
  it(`should properly lower speed on a ship flying through a decelerate zone`, async () => {
    const g = new Game()
    const s = await g.addHumanShip(humanShipData())
    const z = await g.addZone(zoneData(`decelerate`))
    z.location = [10, 0]
    s.location = [10, 0]
    s.updateVisible()
    s.velocity = [0.01, 0.01]
    s.tick()

    for (let t = 0; t < 5; t++) {
      const prevVelocity = [...s.velocity]
      s.tick()
      expect(s.velocity[0]).to.be.lessThan(prevVelocity[0])
      expect(s.velocity[1]).to.be.lessThan(prevVelocity[1])
    }
  })
})
