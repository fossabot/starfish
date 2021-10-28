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

import {
  basicPlanetData,
  crewMemberData,
  humanShipData,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'

describe(`Combat HumanShip target selection`, () => {
  it(`should return ships closest to farthest from getEnemiesInAttackRange`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    let ship3 = await g.addHumanShip(humanShipData())

    ship2.move([0.0001, 0])
    ship3.move([0.0002, 0])

    ship.updateVisible()

    const ships = ship.getEnemiesInAttackRange()
    expect(ships.length).to.equal(2)
    expect(ships[0].id).to.equal(ship2.id)
    expect(ships[1].id).to.equal(ship3.id)
  })

  it(`should properly calculate the majority tactic`, async () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++)
      await ship.addCrewMember(crewMemberData())

    // if no one is there, default to pacifist
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`pacifist`)
    for (let cm of ship.crewMembers) cm.goTo(`weapons`)

    // 'none' defaults to pacifist
    for (let cm of ship.crewMembers)
      cm.combatTactic = `none`
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`pacifist`)

    for (let cm of ship.crewMembers)
      cm.combatTactic = `pacifist`
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`pacifist`)

    for (let cm of ship.crewMembers)
      cm.combatTactic = `defensive`
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`defensive`)

    // less than half
    for (let cm of ship.crewMembers.slice(0, 4))
      cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`defensive`)

    // +2 = more than half
    for (let cm of ship.crewMembers.slice(4, 6))
      cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    expect(ship.combatTactic).to.equal(`aggressive`)
  })

  it(`should properly calculate the majority target item type`, async () => {
    let ship = new HumanShip(humanShipData())
    for (let i = 0; i < 10; i++)
      await ship.addCrewMember(crewMemberData())

    // if no one is there, default to 'any'
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`any`)

    // if no one has a selection, 'any'
    for (let cm of ship.crewMembers) cm.goTo(`weapons`)
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`any`)

    // if only 1 person has a selection, that person's selection
    ship.crewMembers[0].targetItemType = `armor`
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`armor`)

    for (let cm of ship.crewMembers)
      cm.targetItemType = `weapon`
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`weapon`)

    // less than half
    for (let cm of ship.crewMembers.slice(0, 4))
      cm.targetItemType = `communicator`
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`weapon`)

    // more than half
    for (let cm of ship.crewMembers.slice(4, 6))
      cm.targetItemType = `communicator`
    ship.recalculateTargetItemType()
    expect(ship.targetItemType).to.equal(`communicator`)
  })

  it(`should properly calculate the majority target ship`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    let ship3 = await g.addHumanShip(humanShipData())
    for (let i = 0; i < 10; i++)
      await ship.addCrewMember(crewMemberData())

    // (skips updating this if pacifist)
    for (let cm of ship.crewMembers)
      cm.combatTactic = `defensive`

    // if no one is there, default to null
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(null)

    // if no one has a selection, null
    for (let cm of ship.crewMembers) cm.goTo(`weapons`)
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(null)

    // if only 1 person has a selection, that person's selection
    ship.crewMembers[0].attackTargetId = ship2.id
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(ship2)

    for (let cm of ship.crewMembers)
      cm.attackTargetId = ship2.id
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(ship2)

    // less than half
    for (let cm of ship.crewMembers.slice(0, 4))
      cm.attackTargetId = ship3.id
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(ship2)

    // more than half
    for (let cm of ship.crewMembers.slice(4, 6))
      cm.attackTargetId = ship3.id
    ship.determineTargetShip()
    expect(ship.idealTargetShip).to.equal(ship3)
  })

  it(`should properly pick the closest target ship`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    let ship3 = await g.addHumanShip(humanShipData())
    for (let i = 0; i < 10; i++)
      await ship.addCrewMember(crewMemberData())
    for (let cm of ship.crewMembers) cm.goTo(`weapons`)

    ship.move([0, 0])
    ship2.move([0.0001, 0])
    ship3.move([0.0002, 0])
    ship.updateVisible()
    expect(ship.visible.ships.length).to.equal(2)

    // any + aggressive = closest
    const cm = ship.crewMembers[0]
    cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    cm.attackTargetId = `any`
    ship.determineTargetShip()
    expect(ship.targetShip).to.equal(ship2)
  })

  it(`should properly pick the closest target ship if 'closest' is the most common target`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    let ship3 = await g.addHumanShip(humanShipData())
    for (let i = 0; i < 10; i++)
      await ship.addCrewMember(crewMemberData())
    for (let cm of ship.crewMembers) cm.goTo(`weapons`)

    ship.move([0, 0])
    ship2.move([0.0001, 0])
    ship3.move([0.0002, 0])
    ship.updateVisible()
    expect(ship.visible.ships.length).to.equal(2)

    for (let cm of ship.crewMembers)
      cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    ship.crewMembers[0].attackTargetId = `closest`
    ship.determineTargetShip()
    expect(ship.targetShip?.id).to.equal(ship2.id)

    ship.crewMembers[1].attackTargetId = `closest`
    ship.crewMembers[2].attackTargetId = ship3.id
    ship.determineTargetShip()
    expect(ship.targetShip?.id).to.equal(ship2.id)
  })

  it(`should not be possible to target a ship that's on a pacifist planet`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())

    await ship.addCrewMember(crewMemberData())
    const cm = ship.crewMembers[0]
    cm.goTo(`weapons`)

    ship.move([0, 0])
    ship2.move([0.0001, 0])
    ship2.updateVisible()
    expect(ship2.getEnemiesInAttackRange().length).to.equal(
      1,
    )

    expect(ship.planet).to.equal(false)
    await g.addBasicPlanet(basicPlanetData())
    ship.updateVisible()
    ship.updatePlanet()
    expect(ship.planet).to.not.equal(false)
    ship2.updateVisible()
    expect(ship2.getEnemiesInAttackRange().length).to.equal(
      0,
    )
  })

  it(`should find a new best target if the current target becomes untargetable`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData())
    let ship2 = await g.addHumanShip(humanShipData())
    let ship3 = await g.addHumanShip(humanShipData())

    ship2.move([0.0001, 0])
    ship3.move([0.0002, 0])

    await ship.addCrewMember(crewMemberData())
    const cm = ship.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()

    ship.updateVisible()
    ship.determineTargetShip()
    expect(ship.targetShip).to.equal(ship2)

    ship2.move([1000, 0])
    ship.updateVisible()
    ship.determineTargetShip()
    expect(ship.targetShip).to.equal(ship3)
  })
})

describe(`Combat attacks`, () => {
  it(`should take damage on being hit by an attack`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData(`test1`))
    let ship2 = await g.addHumanShip(humanShipData())

    let prevHp = ship2._hp

    ship.updateVisible()
    await ship.addCrewMember(crewMemberData())
    const cm = ship.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    ship.autoAttack(999)
    expect(ship2._hp).to.be.lessThan(prevHp)
  })
})

describe(`Combat death`, () => {
  it(`should die and become invisible and untargetable when taking lethal damage`, async () => {
    const g = new Game()
    let ship = await g.addHumanShip(humanShipData(`test1`))
    let ship2 = await g.addHumanShip(humanShipData())

    let prevHp = ship2._hp

    ship.updateVisible()
    await ship.addCrewMember(crewMemberData())
    const cm = ship.crewMembers[0]
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    ship.recalculateCombatTactic()
    ship.autoAttack(999)
    expect(ship2._hp).to.be.lessThan(prevHp)

    while (ship2._hp > 0) {
      ship.weapons.forEach((w) => (w.cooldownRemaining = 0))
      ship.autoAttack(999)
    }
    expect(ship2._hp).to.equal(0)
    expect(ship2.dead).to.equal(true)
    expect(ship.targetShip).to.equal(null)

    ship.updateVisible()
    expect(ship.visible.ships.length).to.equal(0)
  })
})
