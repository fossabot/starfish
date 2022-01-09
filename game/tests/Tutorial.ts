/* eslint-disable no-unused-expressions */
import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import { crewMemberData, humanShipData } from './defaults'

describe(`Tutorial`, () => {
  it(`should put a new CrewMember into a tutorial, spawning a ship and linking properly to the member on the main ship`, async () => {
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    const cm = await ship.addCrewMember(crewMemberData())

    await c.sleep(1)

    expect(game.humanShips.length).to.equal(2)
    expect(typeof cm.tutorialShipId).to.equal(`string`)

    const mainShip = game.humanShips.find((s) => s.id !== cm.tutorialShipId)
    const tutorialShip = game.ships.find((s) => s.id === cm.tutorialShipId)

    expect(mainShip).to.exist
    expect(mainShip?.crewMembers.length).to.equal(1)
    expect(mainShip?.crewMembers[0].id).to.equal(cm.id)
    expect(mainShip?.crewMembers[0].tutorialShipId).to.equal(tutorialShip?.id)

    expect(tutorialShip).to.exist
    expect(tutorialShip?.tutorial).to.exist
    expect(tutorialShip?.crewMembers.length).to.equal(1)
    expect(tutorialShip?.crewMembers[0].id).to.equal(cm.id)
    expect(tutorialShip?.crewMembers[0].mainShipId).to.equal(mainShip?.id)
  })

  it(`should remove the tutorial ship and references to it upon tutorial end`, async () => {
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    const cm = await ship.addCrewMember(crewMemberData())

    await c.sleep(1)

    await game.ships.find((s) => s.id === cm.tutorialShipId)?.tutorial?.done()

    expect(game.ships.length).to.equal(1)
    expect(ship?.crewMembers[0].tutorialShipId).to.not.exist
  })

  it(`should not put a new CrewMember into a tutorial if they are already in another ship`, async () => {
    let game = new Game()
    let ship = await game.addHumanShip(humanShipData())
    const cm = await ship.addCrewMember(crewMemberData())

    await c.sleep(1)

    await game.ships.find((s) => s.id === cm.tutorialShipId)?.tutorial?.done()

    let ship2 = await game.addHumanShip(humanShipData())
    const cm2 = await ship2.addCrewMember({
      ...crewMemberData(),
      id: cm.id,
    })

    expect(game.humanShips.length).to.equal(2)
    expect(cm2.tutorialShipId).to.not.exist
  })
})
