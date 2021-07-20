import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { Faction } from '../Faction'
import { CombatShip } from './CombatShip'
import type { Ship } from './Ship'
import type { Planet } from '../Planet'
import type { Cache } from '../Cache'
import type { Zone } from '../Zone'
import type { AttackRemnant } from '../AttackRemnant'
import * as itemData from '../../presets/items'
import type { Weapon } from '../Item/Weapon'

export class AIShip extends CombatShip {
  readonly human: boolean = false
  readonly id: string
  readonly spawnPoint: CoordinatePair
  level = 1

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

  keyAngle = Math.random() * 365
  targetLocation: CoordinatePair

  obeysGravity = false

  constructor(data: BaseAIShipData, game: Game) {
    super(data, game)
    if (data.id) this.id = data.id
    else this.id = `ai${Math.random()}`.substring(2)

    if (data.onlyVisibleToShipId)
      this.onlyVisibleToShipId = data.onlyVisibleToShipId

    this.planet = false

    this.ai = true
    this.human = false

    if (data.headerBackground)
      this.headerBackground = data.headerBackground

    if (data.level) this.level = data.level
    if (this.items.length === 0)
      this.addLevelAppropriateItems()
    if (this.items.length === 0) setTimeout(this.die, 1000)
    if (data.spawnPoint?.length === 2)
      this.spawnPoint = [...data.spawnPoint]
    else this.spawnPoint = [...this.location]
    this.targetLocation = [...this.location]
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
      [`ship`],
    )
    if (this.onlyVisibleToShipId) {
      const onlyVisibleShip = this.game.humanShips.find(
        (s) => s.id === this.onlyVisibleToShipId,
      )
      if (onlyVisibleShip)
        this.visible.ships.push(onlyVisibleShip)
    }

    // recharge weapons
    this.weapons.forEach(
      (w) =>
        (w.cooldownRemaining -=
          c.getWeaponCooldownReductionPerTick(this.level)),
    )

    // ----- zone effects -----
    this.applyZoneTickEffects()

    // attack enemy in range
    const weapons = this.availableWeapons()
    if (!weapons.length) return
    const enemies = this.getEnemiesInAttackRange().filter(
      (e) =>
        !this.onlyVisibleToShipId ||
        e.id === this.onlyVisibleToShipId,
    )
    if (enemies.length) {
      const randomEnemy = c.randomFromArray(
        enemies,
      ) as CombatShip
      const distance = c.distance(
        randomEnemy.location,
        this.location,
      )
      const randomWeapon = c.randomFromArray(
        weapons.filter((w) => w.range >= distance),
      ) as Weapon
      if (randomWeapon)
        this.attack(randomEnemy, randomWeapon)
    }
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillType) {
    return this.level
  }

  addLevelAppropriateItems() {
    // c.log(`Adding items to level ${this.level} ai...`)
    let itemBudget = this.level * c.aiDifficultyMultiplier

    const validChassis = Object.values(itemData.chassis)
      .filter(
        (i: BaseChassisData) => i.rarity <= itemBudget / 3,
      )
      .sort(
        (a: BaseChassisData, b: BaseChassisData) =>
          b.rarity - a.rarity,
      )
    const chassisToBuy: BaseChassisData =
      validChassis[0] || itemData.chassis.starter1
    this.chassis = chassisToBuy
    itemBudget -= chassisToBuy.rarity
    // c.log(
    //   `adding chassis ${chassisToBuy.displayName} with remaining budget of ${itemBudget}`,
    // )

    let canAddMoreItems = true
    const isInBudget = (i: BaseItemData) =>
      i.rarity <= itemBudget
    const isBuyable = (i: BaseItemData) =>
      i.buyable !== false

    while (canAddMoreItems) {
      const typeToAdd: `engine` | `weapon` =
        this.weapons.length === 0
          ? `weapon`
          : this.engines.length === 0
          ? `engine`
          : c.randomFromArray([`engine`, `weapon`])
      const itemPool = itemData[typeToAdd]
      const validItems: BaseItemData[] = Object.values(
        itemPool,
      )
        .filter(isInBudget)
        .filter(isBuyable)
      if (!validItems.length) {
        canAddMoreItems = false
        continue
      }
      const itemToAdd: BaseItemData =
        c.randomFromArray(validItems)
      this.addItem(itemToAdd)
      itemBudget -= itemToAdd.rarity
      // c.log(
      //   `adding item ${itemToAdd.displayName} with remaining budget of ${itemBudget}`,
      // )

      if (this.slots <= this.items.length)
        canAddMoreItems = false
    }
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

    const hasArrived =
      Math.abs(this.location[0] - this.targetLocation[0]) <
        c.ARRIVAL_THRESHOLD / 2 &&
      Math.abs(this.location[1] - this.targetLocation[1]) <
        c.ARRIVAL_THRESHOLD / 2
    if (!hasArrived) {
      const unitVectorToTarget = c.degreesToUnitVector(
        c.angleFromAToB(this.location, this.targetLocation),
      )

      const thrustMagnitude =
        c.lerp(0.00001, 0.0001, this.level / 100) *
        engineThrustMultiplier *
        c.gameSpeedMultiplier

      this.location[0] +=
        unitVectorToTarget[0] *
        thrustMagnitude *
        (c.deltaTime / c.TICK_INTERVAL)
      this.location[1] +=
        unitVectorToTarget[1] *
        thrustMagnitude *
        (c.deltaTime / c.TICK_INTERVAL)
    }

    // ----- set new target location -----
    if (Math.random() < 0.000015 * c.TICK_INTERVAL) {
      const distance = (Math.random() * this.level) / 2
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

      this.targetLocation = [
        this.location[0] + unitVector[0] * distance,
        this.location[1] + unitVector[1] * distance,
      ]

      // ----- add previousLocation because it will be turning -----
      this.previousLocations.push([...this.location])
      while (
        this.previousLocations.length >
        AIShip.maxPreviousLocations / 2
      )
        this.previousLocations.shift()
    }
  }

  die() {
    super.die()

    const amount =
      Math.ceil(Math.random() * this.level * 30) +
      this.level
    const cacheContents: CacheContents[] = [
      { type: `credits`, amount },
    ]
    this.game.addCache({
      contents: cacheContents,
      location: this.location,
      message: `Remains of ${this.name}`,
      onlyVisibleToShipId: this.onlyVisibleToShipId,
    })

    this.game.removeShip(this)
  }
}
