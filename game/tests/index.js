const { Game } = require(`../dist/game/Game`)
const {
  HumanShip,
} = require(`../dist/game/classes/Ship/HumanShip`)

const { expect } = require(`chai`)
const { describe, it } = require(`mocha`)

const sinon = require(`sinon`)
const chai = require(`chai`)

// ... imports for the classes under test

const sinonChai = require(`sinon-chai`)
const {
  CrewMember,
} = require(`../dist/game/classes/CrewMember/CrewMember`)

chai.use(sinonChai)

describe(`HumanShip Basic Tests`, () => {
  // let testGame = sinon.createStubInstance(Game)

  // let testGame = new Game(),
  //   gameMock = sinon.mock(testGame)

  it(`should create a HumanShip`, () => {
    let testShip = new HumanShip()
    expect(testShip).to.be.an.instanceof(HumanShip)
  })

  it(`should be able to add CrewMembers to a HumanShip`, () => {
    let testShip = new HumanShip()
    for (let i = 0; i < 10; i++) {
      testShip.addCrewMember({}, true)
    }
    expect(testShip.crewMembers.length).to.equal(10)
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
