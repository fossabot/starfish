import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { Faction } from '../Faction'
import { CombatShip } from './CombatShip'

export class AIShip extends CombatShip {
  readonly human: boolean = false
  readonly id: string
  readonly faction: Faction | false
  readonly spawnPoint: CoordinatePair
  level = 1

  keyAngle = Math.random() * 365
  targetLocation: CoordinatePair

  obeysGravity = false

  constructor(data: BaseShipData, game: Game) {
    super(data, game)
    if (data.id) this.id = data.id
    else this.id = `${Math.random()}`.substring(2)

    this.planet = false

    this.ai = true
    this.human = false

    if (data.level) this.level = data.level

    if (data.spawnPoint?.length === 2)
      this.spawnPoint = data.spawnPoint
    else this.spawnPoint = this.location
    this.targetLocation = this.location

    this.faction =
      game.factions.find((f) => f.ai === true) || false
  }

  tick() {
    super.tick()
    if (this.dead) return

    // ----- move -----
    this.move()

    this.visible = this.game.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      `ship`,
    )

    // recharge weapons
    this.weapons.forEach(
      (w) =>
        (w.cooldownRemaining -=
          c.getWeaponCooldownReductionPerTick(this.level)),
    )

    // attack enemy in range
    const weapons = this.availableWeapons()
    if (!weapons.length) return
    const enemies = this.getEnemiesInAttackRange()
    if (enemies.length) {
      const randomEnemy = c.randomFromArray(enemies)
      const randomWeapon = c.randomFromArray(weapons)
      this.attack(randomEnemy, randomWeapon)
    }
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillName) {
    return this.level
  }

  // ----- move -----
  move(toLocation?: CoordinatePair) {
    super.move(toLocation)
    if (toLocation) return
    if (!this.canMove) return

    const startingLocation: CoordinatePair = [
      ...this.location,
    ]

    const engineThrustMultiplier = this.engines
      .filter((e) => e.repair > 0)
      .reduce(
        (total, e) =>
          total + e.thrustAmplification * e.repair,
        0,
      )

    if (
      !(
        Math.abs(
          this.location[0] - this.targetLocation[0],
        ) <
          c.ARRIVAL_THRESHOLD / 2 &&
        Math.abs(
          this.location[1] - this.targetLocation[1],
        ) <
          c.ARRIVAL_THRESHOLD / 2
      )
    ) {
      const unitVectorToTarget = c.degreesToUnitVector(
        c.angleFromAToB(this.location, this.targetLocation),
      )

      const thrustMagnitude =
        c.getThrustMagnitudeForSingleCrewMember(
          this.level,
          engineThrustMultiplier,
        )

      this.location[0] +=
        unitVectorToTarget[0] *
        thrustMagnitude *
        (c.deltaTime / 1000)
      this.location[1] +=
        unitVectorToTarget[1] *
        thrustMagnitude *
        (c.deltaTime / 1000)
    }

    // ----- set new target location -----
    if (Math.random() < 0.03) {
      const distance = (Math.random() * this.level) / 7
      const currentAngle = c.angleFromAToB(
        this.location,
        this.targetLocation,
      )
      const possibleAngles = [
        this.keyAngle,
        (this.keyAngle + 90) % 360,
        (this.keyAngle + 180) % 360,
        (this.keyAngle + 270) % 360,
      ].filter((a) => {
        const diff = c.angleDifference(a, currentAngle)
        return diff > 1 && diff < 179
      })
      const angleToHome = c.angleFromAToB(
        this.location,
        this.spawnPoint,
      )
      const chosenAngle =
        Math.random() > 1
          ? c.randomFromArray(possibleAngles)
          : possibleAngles.reduce(
              (lowest, a) =>
                c.angleDifference(angleToHome, a) <
                c.angleDifference(angleToHome, lowest)
                  ? a
                  : lowest,
              possibleAngles[0],
            )
      const unitVector = c.degreesToUnitVector(chosenAngle)

      // c.log(angleToHome, chosenAngle, unitVector)

      this.targetLocation = [
        this.location[0] + unitVector[0] * distance,
        this.location[1] + unitVector[1] * distance,
      ]
    }

    // ----- add previousLocation -----
    this.addPreviousLocation(startingLocation)
  }

  die() {
    super.die()

    const amount = Math.round(
      Math.random() * this.level * 40,
    )
    const cacheContents: CacheContents[] = [
      { type: `credits`, amount },
    ]
    this.game.addCache({
      contents: cacheContents,
      location: this.location,
      message: `Remains of ${this.name}`,
    })

    this.game.removeShip(this)
  }
}
