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

    this.ai = true
    this.human = false

    if (data.spawnPoint?.length === 2)
      this.spawnPoint = data.spawnPoint
    else this.spawnPoint = this.location
    this.targetLocation = this.location

    this.faction =
      game.factions.find((f) => f.ai === true) || false
  }

  tick() {
    super.tick()

    // recharge weapons
    this.weapons.forEach(
      (w) =>
        (w.cooldownRemaining -= c.deltaTime * this.level),
    )

    // attack human in range
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

    if (Math.random() < 0.1) {
      const pointToAdd = c.randomInsideCircle(
        this.level / 10,
      )
      this.targetLocation = [
        this.spawnPoint[0] + pointToAdd[0],
        this.spawnPoint[1] + pointToAdd[1],
      ]
    }

    if (
      Math.abs(this.location[0] - this.targetLocation[0]) <
        c.arrivalThreshold / 2 &&
      Math.abs(this.location[1] - this.targetLocation[1]) <
        c.arrivalThreshold / 2
    )
      return

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

    // ----- add previousLocation -----
    this.addPreviousLocation(startingLocation)
  }
}
