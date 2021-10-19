import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import loadouts from '../src/game/presets/loadouts'
import defaultGameSettings from '../src/game/presets/gameSettings'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import { crewMemberData, humanShipData } from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'

describe(`HumanShip basics`, () => {
  it(`should create a HumanShip`, async () => {
    // created through game
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    expect(ship).to.be.an.instanceof(HumanShip)

    // created directly
    ship = new HumanShip(humanShipData())
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

    const distributeAmount = Math.floor(
      Math.random() * 1000,
    )

    ship.distributeCargoAmongCrew([
      { id: `credits`, amount: distributeAmount },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.credits).to.be.approximately(
        distributeAmount / 10,
        1,
      )
    })
  })

  it(`should be able to distribute cargo among crew members`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    const distributeAmount = Math.floor(Math.random() * 30)

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: distributeAmount },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.heldWeight).to.be.approximately(
        distributeAmount / 10,
        0.1,
      )
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

describe(`HumanShip death`, () => {
  it(`should spawn a cache on death with the correct amount of credits inside`, () => {
    // test with base ship
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    const distributeAmount = Math.floor(
      Math.random() * 1000,
    )

    ship.distributeCargoAmongCrew([
      { id: `credits`, amount: distributeAmount },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.credits).to.be.approximately(
        distributeAmount / 10,
        1,
      )
    })
    let crewMemberCredits = ship.crewMembers[0].credits
    const itemRefundValue1 = ship.items.reduce(
      (acc, item) => item.toRefundAmount() + acc,
      0,
    )
    let droppedCargo = ship.die()
    expect(droppedCargo).to.have.lengthOf(1)
    expect(droppedCargo[0].id).to.equal(`credits`)
    expect(droppedCargo[0].amount).to.be.approximately(
      crewMemberCredits *
        10 *
        CombatShip.percentOfCreditsKeptOnDeath +
        itemRefundValue1 *
          CombatShip.percentOfCreditsKeptOnDeath,
      1,
    )

    // same test, this time with a big ship
    ship = new HumanShip(humanShipData(`test1`))
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }
    ship.distributeCargoAmongCrew([
      { id: `credits`, amount: distributeAmount },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.credits).to.be.approximately(
        distributeAmount / 10,
        1,
      )
    })
    crewMemberCredits = ship.crewMembers[0].credits
    const itemRefundValue2 = ship.items.reduce(
      (acc, item) => item.toRefundAmount() + acc,
      0,
    )
    droppedCargo = ship.die()
    expect(droppedCargo).to.have.lengthOf(1)
    expect(droppedCargo[0].id).to.equal(`credits`)
    expect(droppedCargo[0].amount).to.be.approximately(
      crewMemberCredits *
        10 *
        CombatShip.percentOfCreditsKeptOnDeath +
        itemRefundValue2 *
          CombatShip.percentOfCreditsKeptOnDeath,
      1,
    )
  })

  it(`should give the correct amount of credits back to the common fund on death`, () => {
    // test with base ship
    let ship = new HumanShip(humanShipData())

    const distributeAmount = Math.floor(
      Math.random() * 1000,
    )

    ship.commonCredits = distributeAmount
    const itemRefundValue2 = ship.items.reduce(
      (acc, item) => item.toRefundAmount() + acc,
      0,
    )
    ship.die()
    expect(ship.commonCredits).to.be.approximately(
      distributeAmount *
        CombatShip.percentOfCreditsKeptOnDeath +
        itemRefundValue2 *
          CombatShip.percentOfCreditsKeptOnDeath,
      0.1,
    )

    // same test, this time with a big ship
    ship = new HumanShip(humanShipData(`test1`))
    ship.commonCredits = distributeAmount
    const itemRefundValue1 = ship.items.reduce(
      (acc, item) => item.toRefundAmount() + acc,
      0,
    )
    ship.die()
    expect(ship.commonCredits).to.be.approximately(
      distributeAmount *
        CombatShip.percentOfCreditsKeptOnDeath +
        itemRefundValue1 *
          CombatShip.percentOfCreditsKeptOnDeath,
      0.1,
    )
  })

  it(`should drop the correct amount of cargo on death`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 10 },
      { id: `oxygen`, amount: 12 },
    ])

    let droppedCargo = ship.die()
    expect(droppedCargo.length).to.equal(2)
    expect(
      droppedCargo.find((ca) => ca.id === `carbon`)?.amount,
    ).to.equal(10)
    expect(
      droppedCargo.find((ca) => ca.id === `oxygen`)?.amount,
    ).to.equal(12)

    // same test, this time with a big ship
    ship = new HumanShip(humanShipData(`test1`))
    for (let i = 0; i < 10; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 10 },
      { id: `oxygen`, amount: 12 },
    ])

    droppedCargo = ship.die()
    expect(droppedCargo.length).to.equal(3)
    expect(
      droppedCargo.find((ca) => ca.id === `carbon`)?.amount,
    ).to.equal(10)
    expect(
      droppedCargo.find((ca) => ca.id === `oxygen`)?.amount,
    ).to.equal(12)
  })
})
