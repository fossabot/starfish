import c from '../../../common/dist'

import { io, stubify } from '../server/io'

import { Ship } from './classes/Ship/Ship'
import { Planet } from './classes/Planet'
import { Cache } from './classes/Cache'
import { Faction } from './classes/Faction'
import { AttackRemnant } from './classes/AttackRemnant'

import { HumanShip } from './classes/Ship/HumanShip'
import { AIShip } from './classes/Ship/AIShip'

import defaultPlanets from './presets/planets'
import defaultFactions from './presets/factions'

export class Game {
  readonly startTime: Date
  readonly ships: Ship[]
  readonly planets: Planet[]
  readonly caches: Cache[]
  readonly factions: Faction[]
  readonly attackRemnants: AttackRemnant[] = []

  constructor() {
    this.startTime = new Date()
    this.ships = []
    this.planets = []
    this.caches = []
    this.factions = []
    this.attackRemnants = []

    this.startGame()
  }

  startGame() {
    c.log(`----- Starting Game -----`)

    defaultPlanets.forEach((p) => {
      this.addPlanet(p)
    })
    defaultFactions.forEach((f) => {
      this.addFaction(f)
    })

    this.tick()
  }

  // ----- general functions -----

  identify() {
    c.log(
      `Game of ${c.GAME_NAME} started at ${this.startTime}, running for ${this.tickCount} ticks`,
    )
    c.log(
      `${this.ships.length} ships, ${this.planets.length} planets, ${this.caches.length} caches`,
    )
    this.planets.forEach((p) => p.identify())
    this.ships.forEach((s) => s.identify())
  }

  // ----- game loop -----

  private tickCount = 0
  private lastTickTime: number = Date.now()
  private lastTickExpectedTime: number = 0
  private averageTickLag: number = 0

  tick() {
    const startTime = Date.now()

    this.tickCount++
    this.ships.forEach((s) => s.tick())
    const attackRemnantExpirationTime =
      Date.now() - AttackRemnant.expireTime
    this.attackRemnants.forEach((ar, index) => {
      if (attackRemnantExpirationTime > ar.time) {
        this.attackRemnants.splice(index, 1)
      }
    })

    // ----- timing

    const elapsedTimeInMs = Date.now() - startTime
    if (elapsedTimeInMs > 10) {
      if (elapsedTimeInMs < 30)
        c.log(
          `Tick took`,
          'yellow',
          elapsedTimeInMs + ` ms`,
        )
      else
        c.log(`Tick took`, 'red', elapsedTimeInMs + ` ms`)
    }

    c.deltaTime = Date.now() - this.lastTickTime

    const thisTickLag =
      c.deltaTime - this.lastTickExpectedTime
    this.averageTickLag = c.lerp(
      this.averageTickLag,
      thisTickLag,
      0.3,
    )
    const nextTickTime = Math.min(
      c.TICK_INTERVAL,
      c.TICK_INTERVAL - this.averageTickLag,
    )
    this.lastTickTime = startTime
    this.lastTickExpectedTime = nextTickTime

    setTimeout(() => this.tick(), nextTickTime)

    io.to('game').emit('game:tick', {
      deltaTime: c.deltaTime,
      game: stubify<Game, GameStub>(this),
    })
  }

  // ----- scan function -----

  scanCircle(
    center: CoordinatePair,
    radius: number,
    ignoreSelf: string | null,
    type?: `ship` | `planet` | `cache` | 'attackRemnant',
  ): {
    ships: Ship[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
  } {
    let ships: Ship[] = [],
      planets: Planet[] = [],
      caches: Cache[] = [],
      attackRemnants: AttackRemnant[] = []
    if (!type || type === `ship`)
      ships = this.ships.filter(
        (s) =>
          s.id !== ignoreSelf &&
          c.pointIsInsideCircle(center, s.location, radius),
      )
    if (!type || type === `planet`)
      planets = this.planets.filter((p) =>
        c.pointIsInsideCircle(center, p.location, radius),
      )
    if (!type || type === `cache`)
      caches = this.caches.filter((k) =>
        c.pointIsInsideCircle(center, k.location, radius),
      )
    if (!type || type === `attackRemnant`)
      attackRemnants = this.attackRemnants.filter(
        (a) =>
          c.pointIsInsideCircle(center, a.start, radius) ||
          c.pointIsInsideCircle(center, a.end, radius),
      )
    return { ships, planets, caches, attackRemnants }
  }

  // ----- entity functions -----

  addHumanShip(data: BaseHumanShipData): HumanShip {
    c.log(`Adding human ship ${data.name} to game`)
    const newShip = new HumanShip(data, this)
    this.ships.push(newShip)
    return newShip
  }

  addAIShip(data: BaseShipData): AIShip {
    c.log(`Adding AI ship ${data.name} to game`)
    const newShip = new AIShip(data, this)
    this.ships.push(newShip)
    return newShip
  }

  addPlanet(data: BasePlanetData): Planet {
    const newPlanet = new Planet(data, this)
    this.planets.push(newPlanet)
    return newPlanet
  }

  addFaction(data: BaseFactionData): Faction {
    const newFaction = new Faction(data, this)
    this.factions.push(newFaction)
    return newFaction
  }

  addCache(data: BaseCacheData): Cache {
    const newCache = new Cache(data, this)
    this.caches.push(newCache)
    return newCache
  }

  addAttackRemnant(
    data: BaseAttackRemnantData,
  ): AttackRemnant {
    const newAttackRemnant = new AttackRemnant(data)
    this.attackRemnants.push(newAttackRemnant)
    return newAttackRemnant
  }

  // ----- export for god view -----

  // export(): GameExport {
  //   return {
  //     planets: JSON.parse(JSON.stringify(this.planets)),
  //     ships: JSON.parse(JSON.stringify(this.ships)),
  //     caches: JSON.parse(JSON.stringify(this.caches)),
  //     attackRemnants: JSON.parse(
  //       jSON.stringify(this.attackRemnants),
  //     ),
  //   }
  // }
}

interface GameExport {
  planets: any
  ships: any
  caches: any
  attackRemnants: any
}
