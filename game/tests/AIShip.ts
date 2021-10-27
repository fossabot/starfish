/* eslint-disable no-unused-expressions */
/* eslint-disable no-promise-executor-return  */

import c from '../../common/src'
import { HumanShip } from '../src/game/classes/Ship/HumanShip/HumanShip'
import { CrewMember } from '../src/game/classes/CrewMember/CrewMember'
import loadouts from '../src/game/presets/loadouts'
import defaultGameSettings from '../src/game/presets/gameSettings'
import { Game } from '../src/game/Game'

import chai, { expect } from 'chai'
import { describe, it } from 'mocha'

import {
  aiShipData,
  crewMemberData,
  humanShipData,
} from './defaults'
import { CombatShip } from '../src/game/classes/Ship/CombatShip'
import { AIShip } from '../src/game/classes/Ship/AIShip/AIShip'

describe(`AIShip spawn`, () => {
  it(`should add level-appropriate items/chassis on spawn`, async () => {
    const g = new Game()
    const ship = await g.addAIShip(aiShipData(3))
    const level3Value = ship.items.reduce(
      (t, i) => t + i.toRefundAmount(),
      0,
    )

    const ship2 = await g.addAIShip(aiShipData(100))
    const level10Value = ship2.items.reduce(
      (t, i) => t + (i.baseData.basePrice.credits || 0),
      0,
    )

    expect(level3Value).to.be.below(level10Value)
    expect(
      ship.chassis.basePrice.credits || 0,
    ).to.be.lessThan(ship2.chassis.basePrice.credits || 0)
  })
})

describe(`AIShip target selection`, () => {
  it(`should properly auto-target`, async () => {
    const g = new Game()
    const flamingo = await g.addAIShip(
      aiShipData(3, `flamingos`),
    )
    const human = await g.addHumanShip(humanShipData())

    flamingo.updateVisible() // also runs determineTargetShip
    expect(flamingo.targetShip).to.be.null

    const cm = await human.addCrewMember(crewMemberData())
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    human.updateVisible()
    human.recalculateCombatTactic()
    human.autoAttack(1)
    expect(flamingo.targetShip).to.equal(human)

    const eagle = await g.addAIShip(aiShipData(3, `eagles`))
    eagle.updateVisible() // also runs determineTargetShip
    expect(eagle.targetShip).to.equal(human)

    human.die()
    expect(eagle.targetShip).to.be.null
    expect(flamingo.targetShip).to.be.null
  })

  it(`should properly move flamingos`, async () => {
    const g = new Game()
    const flamingo = await g.addAIShip(
      aiShipData(3, `flamingos`),
    )
    const human = await g.addHumanShip(
      humanShipData(`test1`),
    )

    human.move([-0.3, 0])
    const cm = await human.addCrewMember(crewMemberData())
    cm.goTo(`weapons`)
    cm.combatTactic = `aggressive`
    human.updateVisible()
    expect(human.visible.ships.length).to.equal(1)
    expect(human.getEnemiesInAttackRange().length).to.equal(
      1,
    )
    human.recalculateCombatTactic()
    human.autoAttack(1)

    flamingo.radii.sight = 1
    flamingo.updateVisible()
    flamingo.determineNewTargetLocation()
    expect(
      c.angleFromAToB(
        flamingo.location,
        flamingo.targetLocation,
      ),
    ).to.be.closeTo(180, 30)
  })
})

describe(`AIShip death`, () => {
  it(`should create a cache on death with level-appropriate contents`, async () => {
    const g = new Game()

    for (let i = 1; i < 100; i += 4) {
      const ship = await g.addAIShip(aiShipData(i))
      ship.die()

      const expectedValue = Math.round(
        AIShip.dropCacheValueMultiplier * ship.level,
      )

      const cache = g.caches[g.caches.length - 1]
      expect(cache).to.exist

      const cacheValue = cache.contents.reduce(
        (t, contents) => {
          let value = 0
          if (contents.id === `credits`)
            value = contents.amount
          else
            value =
              (c.cargo[contents.id]?.basePrice?.credits ||
                0) * contents.amount
          return t + value
        },
        0,
      )

      expect(cacheValue).to.be.greaterThan(0)
      expect(cacheValue).to.be.approximately(
        expectedValue,
        10,
      )
    }
  })
})
