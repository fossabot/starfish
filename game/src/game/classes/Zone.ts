import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Ship } from './Ship/Ship'
import type { HumanShip } from './Ship/HumanShip'
import type { CombatShip } from './Ship/CombatShip'
import { Stubbable } from './Stubbable'
import { getValidZoneLocation } from '../presets/zones'

export class Zone extends Stubbable {
  readonly type = `zone`
  readonly id: string
  readonly name: string
  location: CoordinatePair // wormholes can change location
  readonly radius: number
  readonly game: Game
  readonly effects: ZoneEffect[]
  readonly color: string

  // ? should zones expire after a certain time?

  constructor(
    {
      location,
      radius,
      id,
      color,
      name,
      effects,
    }: BaseZoneData,
    game: Game,
  ) {
    super()
    this.game = game
    this.location = location
    this.radius = radius
    this.name = name
    this.color = color
    this.id = id || `zone${Math.random()}`.substring(2)
    this.effects = effects
  }

  affectShip(ship: CombatShip) {
    if (ship.planet) return
    for (let effect of this.effects) {
      if (
        Math.random() / c.gameSpeedMultiplier >
        effect.procChancePerTick
      )
        return

      const proximityMod = effect.basedOnProximity
        ? (c.distance(this.location, ship.location) /
            this.radius) *
          2 // if based on proximity, doubles at center
        : 1 // otherwise always 1

      const intensity =
        effect.intensity *
        proximityMod *
        c.randomBetween(0.5, 1.5)

      // dot
      if (effect.type === `damage over time`) {
        if (!ship.attackable || ship.planet) return
        let miss = false
        if (effect.dodgeable) {
          const enemyAgility = ship.chassis.agility
          const hitRoll = Math.random()
          if (hitRoll < 0.1) miss = true
          // random passive miss chance
          else
            miss = hitRoll < proximityMod / enemyAgility / 2
        }
        if (miss) return // * misses being announced was annoying and just noise
        ship.takeDamage(this, {
          damage: miss ? 0 : intensity,
          miss,
        })
      }

      // repair
      else if (effect.type === `repair over time`) {
        const repairableItems = ship.items.filter(
          (i) => i.repair <= 0.9995,
        )
        const amountToRepair =
          (effect.intensity /
            100 /
            repairableItems.length) *
          proximityMod
        repairableItems.forEach((ri) => {
          ri.applyRepair(amountToRepair)
        })
      }

      // stamina regen
      else if (effect.type === `stamina regeneration`) {
        ship.crewMembers.forEach((cm) => {
          if (cm.stamina >= cm.maxStamina) return

          cm.stamina +=
            (c.getStaminaGainPerTickForSingleCrewMember(
              this.game.settings.baseStaminaUse,
            ) *
              intensity) /
            (c.deltaTime / c.tickInterval)

          if (cm.stamina > cm.maxStamina)
            cm.stamina = cm.maxStamina

          cm.toUpdate.stamina = cm.stamina
        })
      }

      // accelerate
      else if (effect.type === `accelerate`) {
        const accelerateMultiplier =
          1 + effect.intensity * proximityMod * 0.0004
        ship.velocity[0] *= accelerateMultiplier
        ship.velocity[1] *= accelerateMultiplier
        ship.toUpdate.velocity = ship.velocity
        ship.toUpdate.speed = c.vectorToMagnitude(
          ship.velocity,
        )
      }

      // decelerate
      else if (effect.type === `decelerate`) {
        const decelerateMultiplier =
          1 - effect.intensity * proximityMod * 0.001
        ship.velocity[0] *= decelerateMultiplier
        ship.velocity[1] *= decelerateMultiplier
        ship.toUpdate.velocity = ship.velocity
        ship.toUpdate.speed = c.vectorToMagnitude(
          ship.velocity,
        )
      }

      // wormhole
      else if (effect.type === `wormhole`) {
        ship.location = c.randomInsideCircle(
          this.game.gameSoftRadius,
        )
        ship.logEntry(
          [
            `Your ship has been instantly warped to another part of the universe! The wormhole closed behind you.`,
          ],
          `high`,
        )

        this.moveToRandomLocation()
        c.log(`Moved wormhole to ${this.location}`)
        // this.game.removeZone(this)
      }
    }
  }

  moveToRandomLocation() {
    this.location = getValidZoneLocation(
      this.game,
      this.radius,
    )
  }

  toVisibleStub() {
    return this.stubify()
  }

  toLogStub() {
    return {
      type: `zone`,
      id: this.id,
    }
  }
}
