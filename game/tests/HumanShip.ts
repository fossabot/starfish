import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import loadouts from '../src/game/presets/loadouts'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import { crewMemberData, humanShipData } from './defaults'

describe(`HumanShip basic tests`, () => {
  it(`should create a HumanShip`, () => {
    let ship = new HumanShip(humanShipData())
    expect(ship).to.be.an.instanceof(HumanShip)
  })

  it(`should have items when initialized with a loadout`, () => {
    const data = humanShipData()
    expect(data).to.have.property(`loadout`)
    let ship = new HumanShip(data)
    expect(ship).to.have.property(`items`)
    expect(ship.items).to.be.an(`array`)
    if (data.loadout)
      expect(ship.items).to.have.lengthOf(
        loadouts[data.loadout]?.items?.length || Infinity,
      )
  })

  it(`should be able to add CrewMembers to a HumanShip`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }
    expect(ship.crewMembers.length).to.equal(10)
  })
})

describe(`HumanShip cargo/credit distribution`, () => {
  it(`should be able to distribute credits among crew members`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.distributeCargoAmongCrew([
      { id: `credits`, amount: 100 },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.credits).to.equal(10)
    })
  })

  it(`should be able to distribute cargo among crew members`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 10 },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.heldWeight).to.equal(1)
    })
  })

  it(`should not add cargo above limit`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 1000 },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.heldWeight).to.equal(cm.maxCargoSpace)
    })
  })

  it(`should add cargo properly when there are uneven cargo amounts amongst crewMembers`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    for (let i = 1; i < 10; i++) {
      expect(ship.crewMembers[i].maxCargoSpace).to.equal(10)
    }

    // one person has more but can still receive full amount
    ship.crewMembers[0].addCargo(`carbon`, 1)
    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 10 },
    ])
    expect(ship.crewMembers[0].heldWeight).to.equal(2)
    for (let i = 1; i < 10; i++) {
      expect(ship.crewMembers[i].heldWeight).to.equal(1)
    }

    // one person cannot receive all
    ship.crewMembers[0].addCargo(`carbon`, 7) // will have 9/10 now
    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 19 },
    ])
    expect(ship.crewMembers[0].heldWeight).to.equal(10)
    for (let i = 1; i < 10; i++) {
      expect(ship.crewMembers[i].heldWeight).to.equal(3)
    }

    // one person is full
    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 9 },
    ])
    expect(ship.crewMembers[0].heldWeight).to.equal(10)
    for (let i = 1; i < 10; i++) {
      expect(ship.crewMembers[i].heldWeight).to.equal(4)
    }

    // some full, some max out, some receive full amount
    ship.crewMembers[1].addCargo(`carbon`, 5) // will have 9/10 now
    expect(ship.crewMembers[1].heldWeight).to.equal(9)
    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 17 },
    ])
    expect(ship.crewMembers[0].heldWeight).to.equal(10)
    expect(ship.crewMembers[1].heldWeight).to.equal(10)
    for (let i = 2; i < 10; i++) {
      expect(ship.crewMembers[i].heldWeight).to.equal(6)
    }

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 1000 },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.heldWeight).to.equal(cm.maxCargoSpace)
    })
  })
})
