import c from '../../../../../../common/dist'
import { Game } from '../../../Game'
import { CombatShip } from '../CombatShip'
import type { Ship } from '../Ship'
import type { Planet } from '../../Planet/Planet'
import type { Cache } from '../../Cache'
import type { Zone } from '../../Zone'
import type { AttackRemnant } from '../../AttackRemnant'
import type { Weapon } from '../Item/Weapon'

import ais from './Enemy/ais'

export class AIShip extends CombatShip {
  static dropCacheValueMultiplier = 800
  static resetLastAttackedByIdTime = 1000 * 60 * 60 * 24

  human: boolean = false
  id: string
  spawnPoint: CoordinatePair = [0, 0]
  level = 1

  spawnedById?: string
  neverAttackIds: string[] = []

  scanTypes: ScanType[] = [`humanShip`]

  visible: {
    ships: Ship[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
    zones: Zone[]
  } = {
    ships: [],
    planets: [],
    caches: [],
    attackRemnants: [],
    zones: [],
  }

  guildId: GuildId | undefined = undefined
  targetLocation: CoordinatePair

  until?: number

  lastAttackedById: string | null = null
  resetLastAttackedByIdTimeout: any

  obeysGravity = false

  constructor(
    data: BaseAIShipData = {} as BaseAIShipData,
    game?: Game,
  ) {
    super(data, game)

    this.ai = true
    this.human = false

    if (data.id) this.id = data.id
    else this.id = `ai${Math.random()}`.substring(2)

    if (data.onlyVisibleToShipId)
      this.onlyVisibleToShipId = data.onlyVisibleToShipId
    if (data.neverAttackIds)
      this.neverAttackIds = data.neverAttackIds
    if (data.until) this.until = data.until
    if (data.guildId) this.guildId = data.guildId
    if (data.spawnedById)
      this.spawnedById = data.spawnedById

    this.planet = false

    if (data.level) this.level = data.level

    if (data.spawnPoint?.length === 2)
      this.spawnPoint = [...data.spawnPoint]
    else if (data.location?.length === 2)
      this.spawnPoint = [...data.location]
    else this.spawnPoint = [...this.location]
    this.targetLocation = [...this.location]

    this.updateSightAndScanRadius()
  }

  tick() {
    super.tick()
    if (this.dead) return

    if (this.until && Date.now() > this.until) {
      this.logEntry(`Timed out.`, `low`, `drone`)
      this.die()
      return
    }

    this.updateVisible()

    // ----- move -----
    this.move()

    // recharge weapons
    const rechargePassive =
      this.getPassiveIntensity(`boostWeaponChargeSpeed`) + 1
    this.weapons
      .filter((w) => w.cooldownRemaining > 0)
      .forEach((w) => {
        w.cooldownRemaining -=
          c.getWeaponCooldownReductionPerTick(this.level) *
          rechargePassive
        if (w.cooldownRemaining < 0) w.cooldownRemaining = 0
      })

    // ----- zone effects -----
    this.applyZoneTickEffects()

    // attack enemy in range
    if (this.targetShip) {
      const weapons = this.availableWeapons()
      if (!weapons.length) return

      const distance = c.distance(
        this.targetShip.location,
        this.location,
      )
      const randomWeapon = c.randomFromArray(
        weapons.filter((w) => w.range >= distance),
      ) as Weapon
      if (randomWeapon)
        this.attack(this.targetShip, randomWeapon)
    }
  }

  updateVisible() {
    const previousVisible = this.visible
    this.visible = this.game?.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      this.scanTypes, // * add 'zone' to allow zones to affect ais
    ) || {
      ships: [],
      planets: [],
      zones: [],
      caches: [],
      attackRemnants: [],
    }
    if (this.onlyVisibleToShipId) {
      const onlyVisibleShip = this.game?.humanShips.find(
        (s) => s.id === this.onlyVisibleToShipId,
      )
      if (onlyVisibleShip)
        this.visible.ships.push(onlyVisibleShip)
    }
    this.takeActionOnVisibleChange(
      previousVisible,
      this.visible,
    )
  }

  // ----- move -----
  move(toLocation?: CoordinatePair) {
    const startingLocation: CoordinatePair = [
      ...this.location,
    ]

    super.move(toLocation)
    if (toLocation) {
      this.targetLocation = this.location
      return
    }
    if (!this.canMove) return

    const engineThrustMultiplier =
      this.engines
        .filter((e) => e.repair > 0)
        .reduce(
          (total, e) =>
            total +
            ((e.passiveThrustMultiplier || 0) +
              (e.manualThrustMultiplier || 0)) *
              e.repair,
          0,
        ) *
      (this.game?.settings.baseEngineThrustMultiplier ||
        c.defaultGameSettings.baseEngineThrustMultiplier)

    const hasArrived =
      Math.abs(this.location[0] - this.targetLocation[0]) <
        (this.game?.settings.arrivalThreshold ||
          c.defaultGameSettings.arrivalThreshold) /
          2 &&
      Math.abs(this.location[1] - this.targetLocation[1]) <
        (this.game?.settings.arrivalThreshold ||
          c.defaultGameSettings.arrivalThreshold) /
          2

    if (!hasArrived) {
      const adjustedTargetLocation = this.adjustedTarget(
        this.targetLocation,
      )

      let angleToThrustInDegrees = c.angleFromAToB(
        this.location,
        adjustedTargetLocation,
      )

      const thrustBoostPassiveMultiplier =
        this.getPassiveIntensity(`boostThrust`) + 1

      const baseMagnitude =
        c.getPassiveThrustMagnitudePerTickForSingleCrewMember(
          this.level * 2,
          engineThrustMultiplier,
          this.game?.settings.baseEngineThrustMultiplier ||
            c.defaultGameSettings
              .baseEngineThrustMultiplier,
        ) * thrustBoostPassiveMultiplier

      let thrustMagnitudeToApply = baseMagnitude / this.mass

      // brake passive
      const angleDifferenceToDirection = c.angleDifference(
        angleToThrustInDegrees,
        this.direction,
      )
      let passiveBrakeMultiplier =
        this.getPassiveIntensity(`boostBrake`)
      const brakeBoost =
        1 +
        (angleDifferenceToDirection / 180) *
          passiveBrakeMultiplier
      thrustMagnitudeToApply *= brakeBoost

      const distanceToTarget = c.distance(
        this.location,
        this.targetLocation,
      )
      if (distanceToTarget < thrustMagnitudeToApply)
        thrustMagnitudeToApply = distanceToTarget

      const unitVectorAlongWhichToThrust =
        c.degreesToUnitVector(angleToThrustInDegrees)

      const thrustVector = [
        unitVectorAlongWhichToThrust[0] *
          thrustMagnitudeToApply,
        unitVectorAlongWhichToThrust[1] *
          thrustMagnitudeToApply,
      ] as CoordinatePair

      this.velocity[0] += thrustVector[0]
      this.velocity[1] += thrustVector[1]

      this.location[0] += this.velocity[0]
      this.location[1] += this.velocity[1]

      this.speed = c.vectorToMagnitude(this.velocity)
      this.direction = c.vectorToDegrees(this.velocity)

      this.game?.chunkManager.addOrUpdate(
        this,
        this.location,
      )

      // this.debugPoint(this.targetLocation, `target`)
      // this.debugPoint(adjustedTargetLocation, `adjusted`)
      // this.debugPoint(this.spawnPoint, `spawn`)

      this.addPreviousLocation(
        startingLocation,
        this.location,
      )
    }

    // arrived, look for new target
    else {
      const newTarget = this.determineNewTargetLocation()
      if (newTarget) this.targetLocation = newTarget
    }
  }

  takeDamage(
    attacker: { name: string; [key: string]: any },
    attack: AttackDamageResult,
  ): TakenDamageResult {
    const res = super.takeDamage(attacker, attack)

    this.lastAttackedById = attacker.id
    clearTimeout(this.resetLastAttackedByIdTimeout)
    this.resetLastAttackedByIdTimeout = setTimeout(() => {
      this.lastAttackedById = null
    }, AIShip.resetLastAttackedByIdTime)

    this.targetShip = this.determineTargetShip()
    return res
  }

  updateSightAndScanRadius() {
    this.updateAttackRadius()
    this.radii.sight =
      Math.max(...this.radii.attack, 0.1) * 1.3
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillId) {
    return this.level
  }

  die(attacker?: CombatShip, silently?: boolean) {
    super.die(attacker)
    this.game?.removeShip(this)
  }

  async receiveBroadcast(
    message: string,
    from: Ship,
    garbleAmount: number,
    recipients: Ship[],
  ) {}

  determineNewTargetLocation(): CoordinatePair | false {
    return false
  }

  determineTargetShip(): CombatShip | null {
    return (this.targetShip = null)
  }

  takeActionOnVisibleChange(
    previousVisible,
    currentVisible,
  ) {
    if (
      !this.targetShip ||
      !this.canAttack(this.targetShip)
    )
      this.targetShip = this.determineTargetShip()
  }

  broadcastTo(ship: Ship) {}
}
