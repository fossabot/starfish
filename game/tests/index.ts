// import { Game } from '../src/game/Game'
import { HumanShip } from '../src/game/classes/Ship/HumanShip'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'
// import sinonChai from 'sinon-chai'
// chai.use(sinonChai)

import { crewMemberData, humanShipData } from './defaults'

// ... imports for the classes under test

describe(`HumanShip Basic Tests`, () => {
  // let testGame = sinon.createStubInstance(Game)

  // let testGame = new Game(),
  //   gameMock = sinon.mock(testGame)

  it(`should create a HumanShip`, () => {
    let testShip = new HumanShip(humanShipData())
    expect(testShip).to.be.an.instanceof(HumanShip)
  })

  it(`should be able to add CrewMembers to a HumanShip`, () => {
    let testShip = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      testShip.addCrewMember(crewMemberData(), true)
    }
    expect(testShip.crewMembers.length).to.equal(10)
  })
})

describe(`HumanShip Cargo/Credit Distribution`, () => {
  it(`should be able to distribute cargo among crew members`, () => {
    let testShip = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++) {
      testShip.addCrewMember(crewMemberData(), true)
    }
    // testShip.distributeCargoAmongCrew([{'id': }])
  })
})

// describe(`HumanShip Mining Tests`, () => {
//   // the tests container
//   it(`should create a HumanShip`, () => {
//     // the single test
//     let testGame = mock(`Game`)
//     let humanShip = new HumanShip({
//       data: {},
//       game: testGame,
//     })
//     expect(humanShip).to.be.an.instanceof(HumanShip)
//   })
// })
