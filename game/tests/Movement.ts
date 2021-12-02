/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import {
  cometData,
  crewMemberData,
  humanShipData,
} from './defaults'

describe(`Human movement`, () => {
  it(`should properly set a target location on targeting an object`, async () => {
    const g = new Game()
    const s = await g.addHumanShip(humanShipData())
    const p = await g.addComet(cometData())
    p.location = [10.001, 0]
    s.updateVisible()
    const cm = await s.addCrewMember(crewMemberData(), true)
    cm.location = `cockpit`
    cm.targetObject = p
    cm.tick()

    expect(cm.targetLocation[0]).to.be.approximately(
      p.location[0],
      0.0001,
    )
    expect(cm.targetLocation[1]).to.be.approximately(
      p.location[1],
      0.0001,
    )
  })

  it(`should properly apply passive thrust if alone in cockpit with a target`, async () => {
    const g = new Game()
    const s = await g.addHumanShip(
      humanShipData(`testPassiveEngine`),
    )
    const cm = await s.addCrewMember(crewMemberData(), true)
    cm.targetLocation = [10.001, 0]
    cm.location = `cockpit`
    s.passiveThrust()

    expect(s.speed).to.be.above(0)
    expect(s.direction).to.equal(0)
  })

  it(`should properly target crew average if someone is already targeting something in the cockpit`, async () => {
    const g = new Game()
    const s = await g.addHumanShip(
      humanShipData(`testPassiveEngine`),
    )
    const cm = await s.addCrewMember(crewMemberData(), true)
    const cm2 = await s.addCrewMember(
      crewMemberData(),
      true,
    )
    cm.targetLocation = [10.001, 0]
    cm.location = `cockpit`
    s.passiveThrust()
    const speed = s.speed
    s.hardStop()

    cm2.location = `cockpit`
    s.passiveThrust()
    expect(s.speed).to.be.above(speed)
  })
})
