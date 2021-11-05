/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import loadouts from '../src/game/presets/loadouts'
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

describe(`HumanShip items`, () => {
  it(`should properly update slots when upgrading chassis`, async () => {
    const data = humanShipData()
    let ship = new HumanShip(data)
    expect(ship.slots).to.equal(
      c.items.chassis[ship.chassis.id]?.slots,
    )
    expect(ship.slots).to.exist
    const prevSlots = ship.slots

    ship.swapChassis({ id: `mega3` })
    expect(ship.slots).to.be.greaterThan(prevSlots)
    expect(ship.slots).to.equal(c.items.chassis.mega3.slots)
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

  it(`should add less cargo to a crew member who is inactive`, () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 3; i++) {
      ship.addCrewMember(crewMemberData(), true)
    }

    ship.crewMembers[0].lastActive =
      Date.now() - 1000 * 60 * 60 * 24 * 365
    ship.crewMembers[1].lastActive =
      Date.now() - 1000 * 60 * 60 * 24
    ship.crewMembers[2].lastActive = Date.now()

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 3 },
    ])
    expect(
      ship.crewMembers[1].heldWeight,
    ).to.be.greaterThan(ship.crewMembers[0].heldWeight)
    expect(
      ship.crewMembers[2].heldWeight,
    ).to.be.greaterThan(ship.crewMembers[1].heldWeight)

    ship.distributeCargoAmongCrew([
      { id: `carbon`, amount: 27 },
    ])
    expect(ship.crewMembers[0].heldWeight).to.equal(10)
    expect(ship.crewMembers[1].heldWeight).to.equal(10)
    expect(ship.crewMembers[2].heldWeight).to.equal(10)
  })
})

describe(`HumanShip death`, () => {
  it(`should spawn a cache on death with the correct amount of currency inside`, () => {
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
      {
        id: `crewCosmeticCurrency`,
        amount: distributeAmount,
      },
      { id: `shipCosmeticCurrency`, amount: 2 },
    ])
    ship.crewMembers.forEach((cm) => {
      expect(cm.credits).to.be.approximately(
        distributeAmount / 10,
        1,
      )
      expect(cm.crewCosmeticCurrency).to.be.approximately(
        distributeAmount / 10,
        1,
      )
    })
    expect(ship.shipCosmeticCurrency).to.equal(2)
    let crewMemberCredits = ship.crewMembers[0].credits
    let crewMemberCosmetic =
      ship.crewMembers[0].crewCosmeticCurrency
    const itemRefundValue1 = ship.items.reduce(
      (acc, item) => item.toRefundAmount() + acc,
      0,
    )

    let droppedCargo = ship.die()

    expect(droppedCargo).to.have.lengthOf(3)
    expect(droppedCargo.map((d) => d.id)).to.contain(
      `credits`,
    )
    expect(
      droppedCargo.find((d) => d.id === `credits`)?.amount,
    ).to.be.approximately(
      crewMemberCredits *
        10 *
        CombatShip.percentOfCurrencyKeptOnDeath +
        itemRefundValue1 *
          CombatShip.percentOfCurrencyKeptOnDeath,
      ship.crewMembers.length,
    )
    expect(
      droppedCargo.find(
        (d) => d.id === `crewCosmeticCurrency`,
      )?.amount,
    ).to.be.approximately(
      crewMemberCosmetic *
        10 *
        CombatShip.percentOfCurrencyKeptOnDeath,
      ship.crewMembers.length,
    )
    expect(
      droppedCargo.find(
        (d) => d.id === `shipCosmeticCurrency`,
      )?.amount,
    ).to.equal(
      Math.round(
        2 * CombatShip.percentOfCurrencyDroppedOnDeath,
      ),
    )
    expect(ship.shipCosmeticCurrency).to.equal(
      Math.round(
        2 * CombatShip.percentOfCurrencyKeptOnDeath,
      ),
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
        CombatShip.percentOfCurrencyKeptOnDeath +
        itemRefundValue2 *
          CombatShip.percentOfCurrencyKeptOnDeath,
      ship.crewMembers.length,
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
        CombatShip.percentOfCurrencyKeptOnDeath +
        itemRefundValue2 *
          CombatShip.percentOfCurrencyKeptOnDeath,
      1,
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
        CombatShip.percentOfCurrencyKeptOnDeath +
        itemRefundValue1 *
          CombatShip.percentOfCurrencyKeptOnDeath,
      1,
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
