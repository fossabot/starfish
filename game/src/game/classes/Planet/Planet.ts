import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Stubbable } from '../Stubbable'
import type { Faction } from '../Faction'
import type { HumanShip } from '../Ship/HumanShip'

export class Planet extends Stubbable {
  static readonly massAdjuster = 0.5

  readonly id: string
  readonly type = `planet`
  readonly pacifist: boolean
  readonly rooms: CrewLocation[] = []
  readonly planetType: PlanetType
  readonly name: string
  readonly color: string
  readonly mass: number
  readonly location: CoordinatePair
  readonly game: Game
  readonly creatures?: string[]
  readonly radius: number
  landingRadiusMultiplier: number
  passives: ShipPassiveEffect[]
  xp = 0
  level = 0
  stats: PlanetStatEntry[] = []

  toUpdate: {
    allegiances?: PlanetAllegianceData[]
    priceFluctuator?: number
    repairFactor?: number
    landingRadiusMultiplier?: number
    passives?: ShipPassiveEffect[]
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
    }: BasePlanetData,
    game: Game,
  ) {
    super()
    this.game = game
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

    // * timeout so it has time to run subclass constructor
    setTimeout(() => {
      if (this.level === 0) this.levelUp()

      const levelsToApply = baseLevel - this.level
      for (let i = 0; i < levelsToApply; i++) this.levelUp()

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
    }, 100)
  }

  get shipsAt() {
    return this.game.humanShips.filter(
      (s) => !s.tutorial && s.planet === this,
    )
  }

  async donate(amount: number, faction?: Faction) {
    this.addXp(amount / c.planetContributeCostPerXp)
    this.addStat(`totalDonated`, amount)
    if (faction)
      this.incrementAllegiance(
        faction,
        1 + amount / (c.planetContributeCostPerXp * 2000),
      )
  }

  async addXp(amount: number) {
    if (!amount) return
    this.xp = Math.round(this.xp + amount)
    const previousLevel = this.level
    this.level = c.levels.findIndex(
      (l) =>
        (this.xp || 0) /
          c.planetLevelXpRequirementMultiplier <=
        l,
    )
    const levelDifference =
      this.level * c.planetLevelXpRequirementMultiplier -
      previousLevel * c.planetLevelXpRequirementMultiplier
    c.log({
      amount,
      previousLevel,
      levelDifference,
      xp: this.xp,
    })
    for (let i = 0; i < levelDifference; i++) {
      await this.levelUp()
    }
    if (!levelDifference) {
      this.updateFrontendForShipsAt()
    }
  }

  levelUp() {
    this.level++
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
      c.log(`bumping`, this.xp)
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
    if (distance < this.game.settings.arrivalThreshold)
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
    if (distance < this.game.settings.arrivalThreshold)
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

  updateFrontendForShipsAt() {
    this._stub = null
    this.shipsAt.forEach((s) => {
      s.toUpdate.planet = this.stubify()
    })
  }

  toVisibleStub(): PlanetStub {
    return this.stubify()
  }

  toLogStub(): PlanetLogStub {
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
  incrementAllegiance(
    faction: Faction | FactionStub,
    amount?: number,
  ) {}

  resetLevels() {}
}
