import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Ship } from './Ship/Ship'
import type { HumanShip } from './Ship/HumanShip/HumanShip'
import type { CombatShip } from './Ship/CombatShip'
import { Stubbable } from './Stubbable'
import { getValidZoneLocation } from '../presets/zones'

export class Zone extends Stubbable {
  readonly type = `zone`
  readonly id: string
  readonly name: string
  location: CoordinatePair // wormholes can change location
  readonly radius: number
  readonly spawnTime: number
  game: Game | undefined
  readonly effects: ZoneEffect[]
  readonly color: string

  constructor(
    {
      location,
      radius,
      id,
      color,
      name,
      effects,
      spawnTime,
    }: BaseZoneData,
    game?: Game,
  ) {
    super()
    this.game = game
    this.location = location
    this.radius = radius
    this.name = name
    this.color = color
    this.id = id || `zone${Math.random()}`.substring(2)
    this.effects = effects
    this.spawnTime = spawnTime || Date.now()
  }

  get shipsAt() {
    return (
      this.game?.humanShips.filter(
        (s) =>
          !s.tutorial &&
          c.distance(s.location, this.location) <=
            this.radius,
      ) || []
    )
  }

  shipEnter(ship: CombatShip) {
    // c.log(`ship enter`, ship.name, this.name)
    for (let effect of this.effects) {
      // wormhole
      if (effect.type === `wormhole`) {
        ship.location = c.randomInsideCircle(
          this.game?.gameSoftRadius || 1,
        )
        ship.logEntry(
          `🌀 Warped across the universe!`,
          `critical`,
          `mystery`,
        )

        this.moveToRandomLocation()
        c.log(`Moved wormhole to ${this.location}`)
        // this.game.removeZone(this)
      }

      // broadcast boost
      else if (effect.type === `broadcast boost`) {
        ship.applyPassive({
          id: `boostBroadcastRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
      }

      // sight boost
      else if (effect.type === `sight boost`) {
        ship.applyPassive({
          id: `boostSightRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
        ship.applyPassive({
          id: `boostScanRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
      }
    }
  }

  shipLeave(ship: CombatShip) {
    // c.log(`ship leave`, ship.name, this.name)
    for (let effect of this.effects) {
      // broadcast boost
      if (effect.type === `broadcast boost`) {
        ship.removePassive({
          id: `boostBroadcastRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
      }

      // sight boost
      else if (effect.type === `sight boost`) {
        ship.removePassive({
          id: `boostSightRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
        ship.removePassive({
          id: `boostScanRange`,
          intensity: effect.intensity,
          data: { source: { zoneName: this.name } },
        })
      }
    }
  }

  affectShip(ship: CombatShip) {
    if (ship.planet) return
    for (let effect of this.effects) {
      if (Math.random() / 10 > effect.procChancePerTick)
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

      // damage over time
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
          targetType: `any`,
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
            c.getStaminaGainPerTickForSingleCrewMember(
              this.game?.settings.baseStaminaUse ||
                c.defaultGameSettings.baseStaminaUse,
              this.game?.settings
                .staminaRechargeMultiplier ||
                c.defaultGameSettings
                  .staminaRechargeMultiplier,
            ) * intensity

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
        if (ship.speed <= 0.01 * (effect.intensity + 0.5))
          return // don't slow SO far down if already slow
        const decelerateMultiplier =
          1 - effect.intensity * proximityMod * 0.001
        ship.velocity[0] *= decelerateMultiplier
        ship.velocity[1] *= decelerateMultiplier
        ship.toUpdate.velocity = ship.velocity
        ship.toUpdate.speed = c.vectorToMagnitude(
          ship.velocity,
        )
      }

      // current
      else if (effect.type === `current`) {
        const angleDifference = c.angleDifference(
          effect.data?.direction || 0,
          ship.direction || 0,
          true,
        )
        const newMagnitude =
          c.vectorToMagnitude(ship.velocity) +
          (ship.speed < 0.00005 * intensity
            ? 0.0000001 * intensity * proximityMod
            : 0)
        const newDirection =
          (ship.direction +
            angleDifference *
              (0.0000001 / newMagnitude) *
              proximityMod) %
          360
        ship.speed = newMagnitude
        ship.direction = newDirection
        ship.velocity = c.vectorFromDegreesAndMagnitude(
          newDirection,
          newMagnitude,
        )
        ship.toUpdate.velocity = ship.velocity
        ship.toUpdate.speed = newMagnitude
        ship.toUpdate.direction = newDirection
      }
    }
  }

  moveToRandomLocation() {
    for (let s of (this.game?.humanShips || []).filter(
      (s) => s.seenLandmarks.includes(this),
    )) {
      s.seenLandmarks.splice(
        s.seenLandmarks.indexOf(this),
        1,
      )
      s.toUpdate.seenLandmarks = s.seenLandmarks.map((z) =>
        z.stubify(),
      )
    }
    const startingLocation: CoordinatePair = [
      ...this.location,
    ]
    this.location = getValidZoneLocation(
      this.radius,
      this.game,
    )
    this.game?.chunkManager.addOrUpdate(
      this,
      startingLocation,
    )
  }

  toVisibleStub() {
    return this.stubify()
  }

  toAdminStub(): ZoneStub {
    return {
      type: `zone`,
      id: this.id,
      location: this.location,
      radius: this.radius,
      color: this.color,
      name: this.name,
      effects: this.effects,
    }
  }

  toReference() {
    return {
      type: `zone`,
      id: this.id,
    }
  }
}
