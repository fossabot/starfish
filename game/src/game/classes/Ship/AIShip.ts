import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { CombatShip } from './CombatShip'
import type { Ship } from './Ship'
import type { Planet } from '../Planet/Planet'
import type { Cache } from '../Cache'
import type { Zone } from '../Zone'
import type { AttackRemnant } from '../AttackRemnant'
import type { Weapon } from '../Item/Weapon'
import type { HumanShip } from './HumanShip'

import ais from './ais/ais'

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

  readonly guildId: GuildId = `fowl`
  speciesId: SpeciesId
  targetLocation: CoordinatePair

  lastAttackedById: string | null = null

  obeysGravity = false

  constructor(data: BaseAIShipData, game: Game) {
    super(data, game)
    if (data.id) this.id = data.id
    else this.id = `ai${Math.random()}`.substring(2)

    this.speciesId = data.speciesId || `chickens`
    this.determineNewTargetLocation =
      ais[this.speciesId]?.determineNewTargetLocation ||
      ais.default.determineNewTargetLocation!

    this.determineTargetShip =
      ais[this.speciesId]?.determineTargetShip ||
      ais.default.determineTargetShip!

    if (data.onlyVisibleToShipId)
      this.onlyVisibleToShipId = data.onlyVisibleToShipId

    this.planet = false

    this.ai = true
    this.human = false

    if (data.level) this.level = data.level
    if (this.items.length === 0)
      this.addLevelAppropriateItems()
    if (this.items.length === 0)
      setTimeout(() => this.die(undefined, false), 1000)
    if (data.spawnPoint?.length === 2)
      this.spawnPoint = [...data.spawnPoint]
    else this.spawnPoint = [...this.location]
    this.targetLocation = [...this.location]
  }

  tick() {
    super.tick()
    if (this.dead) return

    const previousVisible = this.visible
    this.visible = this.game.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      [`humanShip`, `aiShip`], // * add 'zone' to allow zones to affect ais
    )
    if (this.onlyVisibleToShipId) {
      const onlyVisibleShip = this.game.humanShips.find(
        (s) => s.id === this.onlyVisibleToShipId,
      )
      if (onlyVisibleShip)
        this.visible.ships.push(onlyVisibleShip)
    }
    this.takeActionOnVisibleChange(
      previousVisible,
      this.visible,
    )

    // ----- move -----
    this.move()

    // recharge weapons
    this.weapons
      .filter((w) => w.cooldownRemaining > 0)
      .forEach((w) => {
        w.cooldownRemaining -=
          c.getWeaponCooldownReductionPerTick(this.level)
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

  updateSightAndScanRadius() {
    this.updateAttackRadius()
    this.radii.sight = this.radii.attack * 1.3
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillId) {
    return this.level
  }

  addLevelAppropriateItems() {
    // c.log(`Adding items to level ${this.level} ai...`)
    let itemBudget =
      this.level * this.game.settings.aiDifficultyMultiplier

    const validChassis = Object.values(c.items.chassis)
      .filter(
        (i: BaseChassisData) => i.rarity <= itemBudget / 3,
      )
      .sort(
        (a: BaseChassisData, b: BaseChassisData) =>
          b.rarity - a.rarity,
      )
    const chassisToBuy: BaseChassisData =
      validChassis[0] || c.items.chassis.starter1
    this.swapChassis(chassisToBuy)
    itemBudget -= chassisToBuy.rarity
    // c.log(
    //   `adding chassis ${chassisToBuy.displayName} with remaining budget of ${itemBudget}`,
    // )

    const isInBudget = (i: BaseItemData) =>
      i.rarity <= itemBudget
    const isBuyable = (i: BaseItemData) =>
      i.buyable !== false

    while (true) {
      const typeToAdd: `engine` | `weapon` =
        this.weapons.length === 0
          ? `weapon`
          : this.engines.length === 0
          ? `engine`
          : c.randomFromArray([`engine`, `weapon`])
      const itemPool = c.items[typeToAdd]
      const validItems: BaseItemData[] = Object.values(
        itemPool,
      )
        .filter(isInBudget)
        .filter(isBuyable)

      if (!validItems.length) break

      const itemToAdd: BaseItemData =
        c.randomFromArray(validItems)
      this.addItem(itemToAdd)
      itemBudget -= itemToAdd.rarity
      // c.log(
      //   `adding item ${itemToAdd.displayName} with remaining budget of ${itemBudget}`,
      // )

      if (this.slots <= this.items.length) break
    }
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
            total + e.thrustAmplification * e.repair,
          0,
        ) * this.game.settings.baseEngineThrustMultiplier

    const hasArrived =
      Math.abs(this.location[0] - this.targetLocation[0]) <
        this.game.settings.arrivalThreshold / 2 &&
      Math.abs(this.location[1] - this.targetLocation[1]) <
        this.game.settings.arrivalThreshold / 2

    if (!hasArrived) {
      this.direction = c.angleFromAToB(
        this.location,
        this.targetLocation,
      )
      const unitVectorToTarget = c.degreesToUnitVector(
        this.direction,
      )

      const thrustMagnitude =
        c.lerp(0.0001, 0.001, this.level / 100) *
        engineThrustMultiplier

      this.location[0] +=
        unitVectorToTarget[0] * thrustMagnitude
      this.location[1] +=
        unitVectorToTarget[1] * thrustMagnitude

      this.speed = thrustMagnitude

      this.game.chunkManager.addOrUpdate(
        this,
        startingLocation,
      )

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

  determineNewTargetLocation(): CoordinatePair | false {
    return false
  }

  die(attacker?: CombatShip, silently?: boolean) {
    super.die(attacker)

    if (!silently) {
      let itemRarity = this.level / 3

      if (attacker) {
        // apply "rarity boost" passive
        const rarityBoostPassive = (
          attacker.passives?.filter(
            (p) => p.id === `boostDropRarity`,
          ) || []
        ).reduce(
          (total: number, p: ShipPassiveEffect) =>
            total + (p.intensity || 0),
          0,
        )
        itemRarity *= 1 + rarityBoostPassive
        c.log(
          `ai drop rarity boosted by passive:`,
          rarityBoostPassive,
        )
      }

      const cacheContents: CacheContents[] = []

      while (cacheContents.length === 0) {
        // always a chance for credits
        if (Math.random() > 0.6) {
          let amount =
            Math.ceil(
              Math.random() + 0.3 * itemRarity * 70,
            ) * 100
          cacheContents.push({ id: `credits`, amount })
        }

        const upperLimit = itemRarity
        const lowerLimit = itemRarity * 0.5 - 0.5
        for (let ca of Object.values(c.cargo)) {
          // c.log(ca.id, ca.rarity, upperLimit, lowerLimit)
          if (
            ca.rarity <= upperLimit &&
            ca.rarity >= lowerLimit &&
            Math.random() > 0.7
          ) {
            const amount = c.r2(
              Math.random() * this.level * 5 + this.level,
            )
            cacheContents.push({ id: ca.id, amount })
          }
        }

        itemRarity -= 0.1
      }
      // c.log(cacheContents)

      this.game.addCache({
        contents: cacheContents,
        location: this.location,
        message: `Remains of ${this.name}`,
        onlyVisibleToShipId: this.onlyVisibleToShipId,
      })
    }

    this.game.removeShip(this)
  }

  async receiveBroadcast(
    message: string,
    from: Ship,
    garbleAmount: number,
    recipients: Ship[],
  ) {
    let oddsToIgnore = 0.99
    if (recipients.length === 1) oddsToIgnore *= 0.4
    if (
      message
        .toLowerCase()
        .indexOf(this.name.toLowerCase()) > -1
    )
      oddsToIgnore = 0.1
    if (Math.random() < oddsToIgnore) return

    // c.log(`ai ship ${this.name} received broadcast`)
    await c.sleep(Math.round(Math.random() * 1000 * 60))

    const textOptions = [
      `Less talk, more squawk!`,
      `The early bird gets the fish...`,
      `It's a bird! It's a plane! ...No, it's a bird.`,
      `I miss fresh air.`,
      `Do you really think you can out-fly us?`,
      `Some of my best friends are fish.`,
      `I hope you're more substantial than the last fish I fried!`,
      `Noisy fish make for good eating.`,
      `Talk all you want, it won't save you.`,
      `Would you pipe down over there?`,
      `Leave the singing to the birds`,
      `Don't get salty.`,
    ]
    // if (this.getStat('kills') > 1)
    // textOptions.push()
    const text = c.randomFromArray(textOptions)
    const garbled = c.garble(text, garbleAmount)
    const toSend = `${garbled.substring(
      0,
      c.maxBroadcastLength,
    )}`
    from.receiveBroadcast(toSend, this, garbleAmount, [
      from,
    ])
  }

  takeActionOnVisibleChange(
    previousVisible,
    currentVisible,
  ) {
    const newlyVisibleHumanShips =
      currentVisible.ships.filter(
        (s) =>
          s.human &&
          !s.planet &&
          !previousVisible.ships.includes(s),
      )
    newlyVisibleHumanShips.forEach((s: HumanShip) => {
      setTimeout(() => {
        this.broadcastTo(s)
      }, Math.random() * 5 * 60 * 1000) // sometime within 5 minutes
    })

    if (
      !this.targetShip ||
      !this.canAttack(this.targetShip)
    )
      this.targetShip = this.determineTargetShip()
  }

  determineTargetShip(): CombatShip | null {
    return null
  }

  takeDamage(
    attacker: { name: string; [key: string]: any },
    attack: AttackDamageResult,
  ): TakenDamageResult {
    const res = super.takeDamage(attacker, attack)
    this.lastAttackedById = attacker.id
    this.targetShip = this.determineTargetShip()
    return res
  }

  broadcastTo(ship: Ship) {
    // baseline chance to say nothing
    if (Math.random() > c.lerp(0.15, 0.3, this.level / 100))
      return

    const distance = c.distance(
      this.location,
      ship.location,
    )
    const maxBroadcastRadius = this.level * 0.04

    // don't message ships that are too far
    if (distance > maxBroadcastRadius) return
    // // don't message ships that are currently at a planet
    // if (ship.planet) return

    const distanceAsPercentOfMaxBroadcastRadius =
      distance / maxBroadcastRadius

    const garbleAmount =
      distanceAsPercentOfMaxBroadcastRadius
    let messageOptions = [
      `My, my, if it isn't a lovely snack!`,
      `Resistance is futile.`,
      `You look tasty.`,
      `Come closer, let's be friends!`,
      `Who ordered the fish filet?`,
      `Swim closer...`,
      `Hi, little fishy...`,
      `I think I smell something delicious!`,
      `I spy a fish!!`,
      `Come over this way, see what happens!`,
      `Get your gills over here!`,
      `It's been years since we had real fish!`,
      `Crack the shell. Get the meat.`,
      `Prepare to go belly-up.`,
      `Food sighted. Prepare to engage.`,
      `PREY SIGHTED! PREPARE FOR COMBA— Oops, wrong channel. Disregard.`,
    ]
    const message = c.garble(
      c.randomFromArray(messageOptions),
      garbleAmount,
    )
    ship.receiveBroadcast(message, this, garbleAmount, [
      ship,
    ])
  }
}
