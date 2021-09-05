import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import { Stubbable } from '../Stubbable'
import type { Faction } from '../Faction'

export class Planet extends Stubbable {
  static readonly massAdjuster = 1

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

    // * timeout so it has time to run subclass contstructor
    setTimeout(() => {
      if (this.level === 0) this.levelUp()

      const levelsToApply = baseLevel - this.level
      for (let i = 0; i < levelsToApply; i++) this.levelUp()
    }, 100)
  }

  get shipsAt() {
    return this.game.humanShips.filter(
      (s) => s.planet === this,
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

  updateFrontendForShipsAt() {
    this._stub = null
    this.shipsAt.forEach((s) => {
      s.toUpdate.planet = this.stubify()
    })
  }

  getVisibleStub(): PlanetStub {
    return this.stubify()
  }

  toLogStub(): PlanetStub {
    const s: PlanetStub = this.stubify()
    return {
      ...s,
      type: `planet`,
      landingRadiusMultiplier: undefined,
    }
  }

  // function placeholders
  incrementAllegiance(
    faction: Faction | FactionStub,
    amount?: number,
  ) {}
}
