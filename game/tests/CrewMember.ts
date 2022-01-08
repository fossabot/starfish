/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import { crewMemberData, humanShipData } from './defaults'

describe(`CrewMember defaults`, () => {
  it(`should have the correct amount of base cargo space for crewMembers`, async () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      await ship.addCrewMember(crewMemberData(), true)
    }
    ship.crewMembers.forEach((cm) => {
      expect(cm.maxCargoSpace).to.equal(
        Math.min(ship.chassis.maxCargoSpace, CrewMember.baseMaxCargoSpace),
      )
    })
  })
})

describe(`CrewMember stamina`, () => {
  it(`should lower total stamina at the same pace for crew members with extra max stamina`, async () => {
    let ship = new HumanShip(humanShipData())
    const cm1 = await ship.addCrewMember(crewMemberData(), true)
    const cm2 = await ship.addCrewMember(crewMemberData(), true)
    cm2.addXp(`endurance`, 10000)
    cm1.location = `cockpit`
    cm2.location = `cockpit`
    cm1.tick()
    cm2.tick()
    expect(cm1.maxStamina).to.be.below(cm2.maxStamina)
    expect(cm1.stamina).to.equal(cm2.stamina)
  })

  it(`should be able to charge over default total stamina for crew members with extra max stamina`, async () => {
    let ship = new HumanShip(humanShipData())
    const cm1 = await ship.addCrewMember(crewMemberData(), true)
    const cm2 = await ship.addCrewMember(crewMemberData(), true)
    cm2.addXp(`endurance`, 10000)
    const start = cm1.maxStamina
    cm2.stamina = start
    cm1.stamina = start
    cm1.tick()
    cm2.tick()
    expect(cm1.stamina).to.equal(start)
    expect(cm2.stamina).to.be.greaterThan(start)
  })
})
