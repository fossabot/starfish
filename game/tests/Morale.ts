/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import { crewMemberData, humanShipData } from './defaults'

describe(`Morale extremes`, () => {
  it(`should apply and remove low morale state when morale dips low and subsequently recovers`, async () => {
    const g = new Game()
    const hs = await g.addHumanShip(humanShipData())
    const cm = await hs.addCrewMember(crewMemberData())
    cm.morale = g.settings.moraleLowThreshold + 0.1
    cm.tick()
    expect(cm.passives.length).to.equal(0)

    cm.changeMorale(-0.2)
    cm.tick()
    expect(cm.passives.length).to.be.greaterThan(0)

    cm.changeMorale(0.2)
    cm.tick()
    expect(cm.passives.length).to.equal(0)
  })
  it(`should apply and remove high morale state when morale goes high and subsequently lowers`, async () => {
    const g = new Game()
    const hs = await g.addHumanShip(humanShipData())
    const cm = await hs.addCrewMember(crewMemberData())
    cm.morale = g.settings.moraleHighThreshold - 0.1
    cm.tick()
    expect(cm.passives.length).to.equal(0)

    cm.changeMorale(0.2)
    cm.tick()
    expect(cm.passives.length).to.be.greaterThan(0)

    cm.changeMorale(-0.2)
    cm.tick()
    expect(cm.passives.length).to.equal(0)
  })
  it(`should properly be able to jump from low to high morale`, async () => {
    const g = new Game()
    const hs = await g.addHumanShip(humanShipData())
    const cm = await hs.addCrewMember(crewMemberData())
    cm.morale = g.settings.moraleLowThreshold - 0.1
    cm.tick()
    const passivesLength = cm.passives.length

    cm.changeMorale(100)
    cm.tick()
    expect(cm.passives.length).to.be.lessThanOrEqual(passivesLength)
  })
})
