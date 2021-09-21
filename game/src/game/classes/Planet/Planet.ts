import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Stubbable } from '../Stubbable'
import type { Faction } from '../Faction'
import type { HumanShip } from '../Ship/HumanShip'

export class Planet extends Stubbable {
  static readonly massAdjuster = 0.5

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
  } = {}

  constructor(
    {
      planetType,
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

    // * timeout so it has time to run subclass contstructor
    setTimeout(() => {
      if (this.level === 0) this.levelUp()

      const levelsToApply = baseLevel - this.level
      for (let i = 0; i < levelsToApply; i++) this.levelUp()
    }, 100)
  }

  get shipsAt() {
    return this.game.humanShips.filter(
      (s) => !s.tutorial && s.planet === this,
    )
  }

  async donate(amount: number, faction?: Faction) {
    this.addXp(amount / c.planetContributeCostPerXp, true)
    this.addStat(`totalDonated`, amount)
    if (faction)
      this.incrementAllegiance(
        faction,
        1 + amount / (c.planetContributeCostPerXp * 200),
      )
  }

  async addXp(amount: number, straightUp: boolean = false) {
    if (!amount) return
    if (!straightUp) amount /= 100
    this.xp = Math.round(this.xp + amount)
    const previousLevel = this.level
    this.level = c.levels.findIndex(
      (l) => (this.xp || 0) <= l,
    )
    const levelDifference = this.level - previousLevel
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

  async levelUp() {
    this.level++
    if (this.xp < c.levels[this.level - 1]) {
      // this will only happen when levelling up from 0, randomize a bit so it's not clear if NO one has ever been here before
      this.xp =
        c.levels[this.level - 1] +
        Math.floor(Math.random() * 100)
    }
  }

  broadcastTo(ship: HumanShip): number | undefined {
    // baseline chance to say nothing
    if (Math.random() > c.lerp(0.9, 0.6, this.level / 100))
      return

    const maxBroadcastRadius = this.level * 0.1
    const distance = c.distance(
      this.location,
      ship.location,
    )

    // don't message ships that are too far
    if (distance > maxBroadcastRadius) return
    // don't message ships that are here already
    if (distance < c.arrivalThreshold) return
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
    if (distance < c.arrivalThreshold) return
    // don't message ships that are currently at a planet
    if (ship.planet) return

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
    }
  }

  addPassive(passive: ShipPassiveEffect) {
    const existing = this.passives.find(
      (p) => p.id === passive.id,
    )
    if (existing)
      existing.intensity =
        (existing.intensity || 0) + (passive.intensity || 1)
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
}
