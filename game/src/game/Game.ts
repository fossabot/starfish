import c from '../../../common/dist'

import io from '../server/io'
import { db } from '../db'

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
  static saveTimeInterval = 1 * 60 * 1000

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

    defaultPlanets.forEach((p) => {
      this.addPlanet(p)
    })
    defaultFactions.forEach((f) => {
      this.addFaction(f)
    })
  }

  startGame() {
    c.log(`----- Starting Game -----`)

    setInterval(() => this.save(), Game.saveTimeInterval)

    this.tick()
  }

  async save() {
    c.log(
      `gray`,
      `----- Saving Game ----- (Tick avg.: ${c.r2(
        this.averageTickLag,
        2,
      )}ms)`,
    )
    const promises: Promise<any>[] = []
    this.ships.forEach((s) => {
      promises.push(db.ship.addOrUpdateInDb(s))
    })
    await Promise.all(promises)
  }

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

    this.expireOldAttackRemnantsAndCaches()
    this.spawnNewCaches()
    this.spawnNewAIs()

    // ----- timing

    const elapsedTimeInMs = Date.now() - startTime
    if (elapsedTimeInMs > 50) {
      if (elapsedTimeInMs < 100)
        c.log(
          `Tick took`,
          `yellow`,
          elapsedTimeInMs + ` ms`,
        )
      else
        c.log(`Tick took`, `red`, elapsedTimeInMs + ` ms`)
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

    io.to(`game`).emit(`game:tick`, {
      deltaTime: c.deltaTime,
      game: c.stubify<Game, GameStub>(this),
    })
  }

  // ----- scan function -----
  // todo mega-optimize this. chunks?
  scanCircle(
    center: CoordinatePair,
    radius: number,
    ignoreSelf: string | null,
    type?:
      | `ship`
      | `planet`
      | `cache`
      | `attackRemnant`
      | `trail`,
    includeTrails: boolean = false,
  ): {
    ships: Ship[]
    trails: CoordinatePair[][]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
  } {
    let ships: Ship[] = [],
      trails: CoordinatePair[][] = [],
      planets: Planet[] = [],
      caches: Cache[] = [],
      attackRemnants: AttackRemnant[] = []
    if (!type || type === `ship`)
      ships = this.ships.filter((s) => {
        if (s.id === ignoreSelf) return false
        if (
          c.pointIsInsideCircle(center, s.location, radius)
        )
          return true
        return false
      })
    if ((!type || type === `trail`) && includeTrails)
      trails = this.ships
        .filter((s) => {
          if (s.id === ignoreSelf) return false
          if (ships.find((ship) => ship === s)) return false
          for (let l of s.previousLocations) {
            if (c.pointIsInsideCircle(center, l, radius))
              return true
          }
          return false
        })
        .map((s) => s.previousLocations)
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
    return {
      ships,
      trails,
      planets,
      caches,
      attackRemnants,
    }
  }

  // ----- radii -----

  get gameSoftRadius() {
    const count = this.humanShips.length
    return Math.sqrt(count)
  }

  get gameSoftArea() {
    return Math.PI * this.gameSoftRadius ** 2
  }

  // ----- tick helpers -----

  expireOldAttackRemnantsAndCaches() {
    const attackRemnantExpirationTime =
      Date.now() - AttackRemnant.expireTime
    this.attackRemnants.forEach((ar, index) => {
      if (attackRemnantExpirationTime > ar.time) {
        this.removeAttackRemnant(ar)
      }
    })

    const cacheExpirationTime =
      Date.now() - Cache.expireTime
    this.caches.forEach((c, index) => {
      if (cacheExpirationTime > c.time) {
        this.removeCache(c)
      }
    })
  }

  spawnNewCaches() {
    if (this.caches.length > this.gameSoftArea * 1.5) return

    const type = c.randomFromArray(c.cargoTypes) as
      | `credits`
      | CargoType
    const amount = Math.round(Math.random() * 200) / 10 + 1
    const location = c.randomInsideCircle(
      this.gameSoftRadius,
    )
    this.addCache({
      contents: [
        {
          type,
          amount,
        },
      ],
      location,
    })
    c.log(
      `gray`,
      `Spawned random cache of ${amount} ${type} at ${location}.`,
    )
  }

  spawnNewAIs() {
    if (
      !this.ships.length ||
      this.aiShips.length > this.gameSoftArea
    )
      return

    let radius = this.gameSoftRadius
    let spawnPoint: CoordinatePair | undefined
    while (!spawnPoint) {
      let point = c.randomInsideCircle(radius)
      const tooClose = this.humanShips.find((hs) =>
        c.pointIsInsideCircle(
          point,
          hs.location,
          hs.radii.sight,
        ),
      )
      if (tooClose) spawnPoint = undefined
      else spawnPoint = point
      radius += 0.1
    }

    const level = c.distance([0, 0], spawnPoint) * 2

    this.addAIShip({
      location: spawnPoint,
      name: `AI${`${Math.random().toFixed(3)}`.substring(
        2,
      )}`,
      loadout: `aiDefault`,
      level,
    })
    c.log(
      `gray`,
      `Spawned level ${level} AI at ${spawnPoint}.`,
    )
  }

  // ----- entity functions -----

  addHumanShip(
    data: BaseHumanShipData,
    save = true,
  ): HumanShip {
    const existing = this.ships.find(
      (s) => s instanceof HumanShip && s.id === data.id,
    ) as HumanShip
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing human ship ${existing.name} (${existing.id}).`,
      )
      return existing
    }
    c.log(`gray`, `Adding human ship ${data.name} to game`)

    data.loadout = `humanDefault`
    const newShip = new HumanShip(data, this)
    this.ships.push(newShip)
    if (save) db.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  addAIShip(data: BaseShipData, save = true): AIShip {
    const existing = this.ships.find(
      (s) => s instanceof AIShip && s.id === data.id,
    ) as AIShip
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing ai ship ${existing.name} (${existing.id}).`,
      )
      return existing
    }
    c.log(`gray`, `Adding AI ship ${data.name} to game`)

    data.loadout = `aiDefault`
    const newShip = new AIShip(data, this)
    this.ships.push(newShip)
    if (save) db.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  removeShip(ship: Ship) {
    c.log(`Removing ship ${ship.name} from the game.`)
    db.ship.removeFromDb(ship.id)
    const index = this.ships.findIndex(
      (ec) => ship.id === ec.id,
    )
    if (index === -1) return
    this.ships.splice(index, 1)
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

  addCache(data: BaseCacheData, save = true): Cache {
    const existing = this.caches.find(
      (cache) => cache.id === data.id,
    )
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing cache (${existing.id}).`,
      )
      return existing
    }
    const newCache = new Cache(data, this)
    this.caches.push(newCache)

    if (save) db.cache.addOrUpdateInDb(newCache)
    return newCache
  }

  removeCache(cache: Cache) {
    db.cache.removeFromDb(cache.id)
    const index = this.caches.findIndex(
      (ec) => cache.id === ec.id,
    )
    if (index === -1) return
    this.caches.splice(index, 1)
  }

  addAttackRemnant(
    data: BaseAttackRemnantData,
    save = true,
  ): AttackRemnant {
    const newAttackRemnant = new AttackRemnant(data)
    this.attackRemnants.push(newAttackRemnant)
    if (save)
      db.attackRemnant.addOrUpdateInDb(newAttackRemnant)
    return newAttackRemnant
  }

  removeAttackRemnant(ar: AttackRemnant) {
    db.attackRemnant.removeFromDb(ar.id)
    const index = this.attackRemnants.findIndex(
      (eAr) => ar.id === eAr.id,
    )
    if (index === -1) return
    this.attackRemnants.splice(index, 1)
  }

  get humanShips(): HumanShip[] {
    return this.ships.filter(
      (s) => s instanceof HumanShip,
    ) as HumanShip[]
  }

  get aiShips(): AIShip[] {
    return this.ships.filter(
      (s) => s instanceof AIShip,
    ) as AIShip[]
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
