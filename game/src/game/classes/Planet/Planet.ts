import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Stubbable } from '../Stubbable'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
import type { CombatShip } from '../Ship/CombatShip'

export class Planet extends Stubbable {
  static readonly massAdjuster = 0.5

  readonly id: string
  readonly type = `planet`
  readonly pacifist: boolean
  readonly rooms: CrewLocation[] = []
  readonly name: string
  readonly mass: number
  game: Game | undefined
  readonly creatures?: string[]
  readonly radius: number
  allegiances: PlanetAllegianceData[] = []
  location: CoordinatePair
  color: string
  planetType: PlanetType
  guildId?: GuildId
  homeworld?: GuildId
  landingRadiusMultiplier: number
  passives: ShipPassiveEffect[]
  xp = 0
  level = 0
  stats: PlanetStatEntry[] = []
  defense: number = 0

  toUpdate: {
    landingRadiusMultiplier?: number
    passives?: ShipPassiveEffect[]
    location?: CoordinatePair
  } = {}

  constructor(
    {
      planetType,
      id,
      name,
      color,
      location,
      mass,
      landingRadiusMultiplier,
      passives,
      pacifist,
      creatures,
      radius,
      xp,
      level,
      baseLevel,
      stats,
      defense,
    }: BasePlanetData,
    game?: Game,
  ) {
    super()
    if (game) this.game = game
    this.planetType = planetType || `basic`
    this.id = id || `planet` + `${Math.random()}`.slice(2)
    this.name = name
    this.color = color
    this.location = location
    this.radius = radius
    this.mass =
      mass ||
      ((5.974e30 * this.radius) / 36000) *
        Planet.massAdjuster
    this.landingRadiusMultiplier =
      landingRadiusMultiplier || 1
    this.passives = passives || []
    this.pacifist = pacifist || true
    this.creatures = creatures || []
    this.level = level
    this.xp = xp
    this.stats = [...(stats || [])]
    this.defense = defense || 0

    // * timeout so it has time to run subclass constructor
    setTimeout(() => {
      if (this.level === 0) this.levelUp()

      const levelsToApply = baseLevel - this.level
      if (!isNaN(levelsToApply))
        for (let i = 0; i < levelsToApply; i++)
          this.levelUp()

      if (
        this.xp <
        c.levels[this.level - 1] *
          c.planetLevelXpRequirementMultiplier
      )
        this.xp =
          c.levels[this.level - 1] *
            c.planetLevelXpRequirementMultiplier +
          Math.floor(
            Math.random() *
              100 *
              c.planetLevelXpRequirementMultiplier,
          )
    }, 10)
  }

  get shipsAt() {
    return (
      this.game?.humanShips.filter(
        (s) => !s.tutorial && s.planet === this,
      ) || []
    )
  }

  tick() {
    this.toUpdate = {}
  }

  tickEffectsOnShip(ship: HumanShip) {
    ship.addStat(`planetTime`, 1)

    const distanceFromPlanet = c.distance(
      this.location,
      ship.location,
    )

    // * if it's inside the drawn planet, don't swirl
    if (distanceFromPlanet < this.radius / c.kmPerAu) return

    // apply swirl effect
    const swirlClockwise = true

    const swirlIntensity =
      200 /
      (ship.mass * 0.1) / // less effect for heavier ships
      (distanceFromPlanet /
        (this.landingRadiusMultiplier *
          (this.game?.settings.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold))) / // less effect farther out
      Math.max(1, ship.speed * 1000000) // less effect if you're in motion

    const angleToShip = c.angleFromAToB(
      this.location,
      ship.location,
    )
    const targetAngle =
      ((swirlClockwise
        ? angleToShip - swirlIntensity
        : angleToShip + swirlIntensity) +
        360) %
      360
    const unitVector = c.degreesToUnitVector(targetAngle)
    const newLocation = [
      unitVector[0] * distanceFromPlanet + this.location[0],
      unitVector[1] * distanceFromPlanet + this.location[1],
    ] as CoordinatePair

    ship.move(newLocation)
  }

  async donate(amount: number, guildId?: GuildId) {
    this.addXp(amount)
    this.addStat(`totalDonated`, amount)
    if (guildId) this.incrementAllegiance(guildId, amount)
  }

  async addXp(amount: number) {
    if (!amount) return
    this.xp = Math.floor(this.xp + amount)
    const previousLevel = this.level
    const newLevel = c.levels.findIndex(
      (l) =>
        (this.xp || 0) <
        l * c.planetLevelXpRequirementMultiplier,
    )
    const levelDifference = newLevel - previousLevel
    // c.log({
    //   amount,
    //   previousLevel,
    //   levelDifference,
    //   xp: this.xp,
    //   xpInCurrentLevel:
    //     c.levels[newLevel] *
    //       c.planetLevelXpRequirementMultiplier -
    //     c.levels[newLevel - 1] *
    //       c.planetLevelXpRequirementMultiplier,
    // })
    for (let i = 0; i < levelDifference; i++) {
      await this.levelUp()
    }
    if (!levelDifference) {
      this.updateFrontendForShipsAt()
    }
  }

  levelUp() {
    this.level++
    if (this.level > 100) this.level = 100 // todo it still adds bonuses past 100
    if (
      this.xp <
      c.levels[this.level - 1] *
        c.planetLevelXpRequirementMultiplier
    ) {
      // this will only happen when levelling up from 0: randomize a bit so it's not clear if NO one has ever been here before
      this.xp =
        c.levels[this.level - 1] *
          c.planetLevelXpRequirementMultiplier +
        Math.floor(
          Math.random() *
            100 *
            c.planetLevelXpRequirementMultiplier,
        )
      // c.log(`bumping`, this.xp)
    }
  }

  broadcastTo(ship: HumanShip): number | undefined {
    // baseline chance to say nothing
    if (Math.random() > c.lerp(0.5, 0.2, this.level / 100))
      return

    const maxBroadcastRadius = this.level * 0.1
    const distance = c.distance(
      this.location,
      ship.location,
    )

    // don't message ships that are too far
    if (distance > maxBroadcastRadius) return
    // don't message ships that are here already
    if (
      distance <
      (this.game?.settings.arrivalThreshold ||
        c.defaultGameSettings.arrivalThreshold)
    )
      return
    // don't message ships that are currently at a planet
    if (ship.planet) return

    const distanceAsPercentOfMaxBroadcastRadius =
      distance / maxBroadcastRadius

    return distanceAsPercentOfMaxBroadcastRadius
  }

  respondTo(
    message: string,
    ship: HumanShip,
  ): number | undefined {
    const maxBroadcastRadius = this.level * 0.1
    const distance = c.distance(
      this.location,
      ship.location,
    )

    // don't message ships that are too far
    if (distance > maxBroadcastRadius) return
    // don't message ships that are here already
    if (
      distance <
      (this.game?.settings.arrivalThreshold ||
        c.defaultGameSettings.arrivalThreshold)
    )
      return
    // don't message ships that are currently at a planet
    if (ship.planet) return
    // passive chance to ignore
    if (Math.random() > c.lerp(0.6, 1, this.level / 100))
      return

    const distanceAsPercentOfMaxBroadcastRadius =
      distance / maxBroadcastRadius

    return distanceAsPercentOfMaxBroadcastRadius
  }

  defend(force = false) {
    if (!this.defense) return
    if (!force && !c.lottery(this.defense, 1000)) return

    const attackRemnantsInSight =
      this.game?.scanCircle(
        this.location,
        c.getPlanetDefenseRadius(this.defense) * 1.5,
        null,
        [`attackRemnant`],
      )?.attackRemnants || []
    if (!attackRemnantsInSight.length) return

    const validTargetIds: string[] = Array.from(
      attackRemnantsInSight.reduce((ids, ar) => {
        if (ar.attacker?.id === this.id) return ids
        const bothHuman =
          !(ar.attacker as any)?.ai &&
          !(ar.defender as any)?.ai
        if (bothHuman) {
          ids.add(ar.attacker?.id)
          ids.add(ar.defender?.id)
        } else {
          if ((ar.attacker as any).ai)
            ids.add(ar.attacker?.id)
          else ids.add(ar.defender?.id)
        }
        return ids
      }, new Set()) as Set<string>,
    )
    if (!validTargetIds.length) return

    const shipsInSight =
      this.game?.scanCircle(
        this.location,
        c.getPlanetDefenseRadius(this.defense),
        null,
        [`aiShip`, `humanShip`],
      )?.ships || []

    const enemiesInRange: CombatShip[] =
      shipsInSight.filter(
        (s) =>
          validTargetIds.includes(s.id) &&
          s.attackable &&
          !this.allegiances.find(
            (a) =>
              a.level >= c.guildAllegianceFriendCutoff &&
              a.guildId === s.guildId,
          ),
      ) as CombatShip[]
    if (enemiesInRange.length === 0) return
    const target = c.randomFromArray(enemiesInRange)
    if (
      !target ||
      !target.attackable ||
      target.planet ||
      target.dead
    )
      return

    // ----- attack enemy -----

    const hitRoll = Math.random()
    const range = c.distance(this.location, target.location)
    const distanceAsPercent =
      range / c.getPlanetDefenseRadius(this.defense) // 1 = far away, 0 = close
    const minHitChance = 0.08
    // 1.0 agility is "normal", higher is better
    const enemyAgility =
      target.chassis.agility +
      (target.passives.find(
        (p) => p.id === `boostChassisAgility`,
      )?.intensity || 0)

    const toHit =
      c.lerp(minHitChance, 1, distanceAsPercent) *
      enemyAgility *
      c.lerp(0.6, 1.4, Math.random()) // add in randomness so chassis+distance can't make it completely impossible to ever hit
    let miss = hitRoll < toHit

    const didCrit = miss
      ? false
      : Math.random() <=
        (this.game?.settings.baseCritChance ||
          c.defaultGameSettings.baseCritChance)

    let damage = miss
      ? 0
      : c.getPlanetDefenseDamage(this.defense) *
        (didCrit
          ? this.game?.settings.baseCritDamageMultiplier ||
            c.defaultGameSettings.baseCritDamageMultiplier
          : 1)

    if (damage === 0) miss = true

    // c.log(
    //   `gray`,
    //   `planet needs to beat ${toHit}, rolled ${hitRoll} for a ${
    //     miss
    //       ? `miss`
    //       : `${
    //           didCrit ? `crit` : `hit`
    //         } of damage ${damage}`
    //   }`,
    // )
    const damageResult: AttackDamageResult = {
      miss,
      damage,
      targetType: `any`,
      didCrit,
      weapon: {
        toReference() {
          return {
            type: `weapon`,
            displayName: `Orbital Mortar`,
            description: `This satellite-mounted weapons system is highly advanced and able to track multiple targets at once. It does, however, lose line of sight periodically as it moves behind its planet.`,
          }
        },
        type: `weapon`,
        displayName: `Orbital Mortar`,
      },
    }
    const attackResult = target.takeDamage(
      this,
      damageResult,
    )

    this.game?.addAttackRemnant({
      attacker: this,
      defender: target,
      damageTaken: attackResult,
      start: [...this.location],
      end: [...target.location],
      time: Date.now(),
    })

    return { target, damageResult }
  }

  updateFrontendForShipsAt() {
    this._stub = null
    this.shipsAt.forEach((s) => {
      s.toUpdate.planet = this.stubify()
    })
  }

  toVisibleStub(): PlanetStub {
    return this.stubify()
  }

  toAdminStub(): PlanetStub {
    return {
      id: this.id,
      name: this.name,
      radius: this.radius,
      color: this.color,
      location: this.location,
      mass: this.mass,
      level: this.level,
      planetType: this.planetType,
      guildId: this.guildId,
      vendor: (this as any).vendor,
      allegiances: (this as any).allegiances,
      priceFluctuator: (this as any).priceFluctuator,
      mine: (this as any).mine,
      bank: (this as any).bank,
      defense: (this as any).defense,
      passives: this.passives,
      landingRadiusMultiplier: this.landingRadiusMultiplier,
    }
  }

  toReference(): PlanetLogStub {
    return {
      type: `planet`,
      name: this.name,
      id: this.id,
    }
  }

  addPassive(passive: ShipPassiveEffect) {
    const existing = this.passives.find(
      (p) => p.id === passive.id,
    )
    if (existing)
      existing.intensity = c.r2(
        (existing.intensity || 0) +
          (passive.intensity || 1),
        5,
      )
    else
      this.passives.push({
        ...passive,
        data: {
          ...passive.data,
          source: { planetName: this.name },
        },
      })

    this.shipsAt.forEach((s) => {
      s.updateThingsThatCouldChangeOnItemChange()
    })
  }

  // ----- stats -----
  addStat(statname: PlanetStatKey, amount: number) {
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount += amount
  }

  // function placeholders
  incrementAllegiance(guildId: GuildId, amount?: number) {}

  resetLevels(toDefault?: boolean) {
    this.level = 0
    this.xp = 0
    this.defense = 0
  }
}
