/* eslint-disable no-unused-expressions */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import { crewMemberData, humanShipData } from './defaults'

describe(`CrewMember defaults`, () => {
  it(`should have the correct amount of base cargo space for crewMembers`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }
    ship.crewMembers.forEach((cm) => {
      expect(cm.maxCargoSpace).to.equal(
        Math.min(
          ship.chassis.maxCargoSpace,
          CrewMember.baseMaxCargoSpace,
        ),
      )
    })
  })
})
