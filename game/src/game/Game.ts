import c from '../../../common/dist'

import io from '../server/io'
import { db } from '../db'

import { Ship } from './classes/Ship/Ship'
import { Planet } from './classes/Planet'
import { Cache } from './classes/Cache'
import { Faction } from './classes/Faction'
import { Species } from './classes/Species'
import { AttackRemnant } from './classes/AttackRemnant'

import { HumanShip } from './classes/Ship/HumanShip'
import { AIShip } from './classes/Ship/AIShip'

import { generatePlanet as generatePlanetData } from './presets/planets'
import defaultFactions from './presets/factions'
import defaultSpecies from './presets/species'

export class Game {
  static saveTimeInterval = 1 * 60 * 1000

  readonly startTime: Date
  readonly ships: Ship[] = []
  readonly planets: Planet[] = []
  readonly caches: Cache[] = []
  readonly factions: Faction[] = []
  readonly species: Species[] = []
  readonly attackRemnants: AttackRemnant[] = []

  constructor() {
    this.startTime = new Date()

    Object.values(defaultFactions).forEach((fd) =>
      this.addFaction(fd),
    )
    Object.values(defaultSpecies).map((sd) =>
      this.addSpecies(sd),
    )

    c.log(
      `Loaded ${
        Object.keys(defaultSpecies).length
      } species and ${
        Object.keys(defaultFactions).length
      } factions.`,
    )
  }

  startGame() {
    c.log(`----- Starting Game -----`)

    setInterval(() => this.save(), Game.saveTimeInterval)

    this.tick()
  }

  async save() {
    c.log(
      `gray`,
      `----- Saving Game ----- (Tick avg: ${c.r2(
        this.averageTickTime,
        2,
      )}ms, Worst human ship avg: ${c.r2(
        this.averageWorstShipTickLag,
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
  private averageWorstShipTickLag: number = 0
  private averageTickTime: number = 0

  tick() {
    const startTime = Date.now()

    this.tickCount++
    const times: any[] = []
    this.ships.forEach((s) => {
      const start = Date.now()
      s.tick()
      const time = Date.now() - start
      times.push({ ship: s, time })
    })
    if (times.length)
      this.averageWorstShipTickLag = c.lerp(
        this.averageWorstShipTickLag,
        times.sort((a, b) => b.time - a.time)[0].time || 0,
        0.1,
      )
    // c.log(times.map((s) => s.ship.name + ` ` + s.time))

    this.expireOldAttackRemnantsAndCaches()
    this.spawnNewCaches()
    this.spawnNewAIs()
    this.spawnNewPlanet()

    // ----- timing

    c.deltaTime = Date.now() - this.lastTickTime

    const thisTickLag =
      c.deltaTime - this.lastTickExpectedTime
    this.averageTickLag = c.lerp(
      this.averageTickLag,
      thisTickLag,
      0.1,
    )
    const nextTickTime = Math.min(
      c.TICK_INTERVAL,
      c.TICK_INTERVAL - this.averageTickLag,
    )
    this.lastTickTime = startTime
    this.lastTickExpectedTime = nextTickTime

    // ----- schedule next tick -----
    setTimeout(() => this.tick(), nextTickTime)

    //   // ----- notify watchers -----
    // io.to(`game`).emit(`game:tick`, {
    //   deltaTime: c.deltaTime,
    //   game: c.stubify<Game, GameStub>(this),
    // })

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
    this.averageTickTime = c.lerp(
      this.averageTickTime,
      elapsedTimeInMs,
      0.1,
    )
  }

  // ----- scan function -----
  // todo mega-optimize this with a chunks system
  scanCircle(
    center: CoordinatePair,
    radius: number,
    ignoreSelf: string | null,
    types?: (
      | `ship`
      | `planet`
      | `cache`
      | `attackRemnant`
      | `trail`
    )[],
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
    if (!types || types.includes(`ship`))
      ships = this.ships.filter((s) => {
        if (
          s.onlyVisibleToShipId &&
          ignoreSelf &&
          s.onlyVisibleToShipId !== ignoreSelf
        )
          return false
        if (s.tutorial && !s.onlyVisibleToShipId)
          return false
        if (s.id === ignoreSelf) return false
        if (
          c.pointIsInsideCircle(center, s.location, radius)
        )
          return true
        return false
      })
    if (
      (!types || types.includes(`trail`)) &&
      includeTrails
    )
      trails = this.ships
        .filter((s) => {
          if (s.tutorial) return false
          if (s.id === ignoreSelf) return false
          if (ships.find((ship) => ship === s)) return false
          for (let l of s.previousLocations) {
            if (c.pointIsInsideCircle(center, l, radius))
              return true
          }
          return false
        })
        .map((s) => s.previousLocations)
    if (!types || types.includes(`planet`))
      planets = this.planets.filter((p) =>
        c.pointIsInsideCircle(center, p.location, radius),
      )
    if (!types || types.includes(`cache`))
      caches = this.caches.filter((k) => {
        if (
          k.onlyVisibleToShipId &&
          ignoreSelf &&
          k.onlyVisibleToShipId !== ignoreSelf
        )
          return false
        return c.pointIsInsideCircle(
          center,
          k.location,
          radius,
        )
      })
    if (!types || types.includes(`attackRemnant`))
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
    const count = this.humanShips.length || 1
    return Math.max(3, Math.sqrt(count) * 2)
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

  spawnNewPlanet() {
    while (
      this.planets.length < this.gameSoftArea ||
      this.planets.length < this.factions.length - 1
    ) {
      const factionThatNeedsAHomeworld = this.factions.find(
        (f) => f.id !== `red` && !f.homeworld,
      )
      const p = generatePlanetData(
        this,
        factionThatNeedsAHomeworld?.id,
      )
      if (!p) return
      const planet = this.addPlanet(p)
      c.log(
        `gray`,
        `Spawned planet ${planet.name} at ${
          planet.location
        }${
          factionThatNeedsAHomeworld
            ? ` (${factionThatNeedsAHomeworld.id} faction homeworld)`
            : ``
        }.`,
      )
      // c.log(this.planets.map((p) => p.vendor.items))
      // c.log(this.planets.map((p) => p.vendor.chassis))
      // c.log(this.planets.map((p) => p.vendor.cargo))
      // c.log(this.planets.map((p) => p.priceFluctuator))
    }
  }

  spawnNewCaches() {
    while (this.caches.length < this.gameSoftArea * 1.5) {
      const type = c.randomFromArray(c.cargoTypes) as
        | `credits`
        | CargoType
      const amount =
        Math.round(Math.random() * 200) / 10 + 1
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
  }

  spawnNewAIs() {
    while (
      this.ships.length &&
      this.aiShips.length < this.gameSoftArea * 1.35
    ) {
      let radius = this.gameSoftRadius
      let spawnPoint: CoordinatePair | undefined
      while (!spawnPoint) {
        let point = c.randomInsideCircle(radius)
        const tooClose = this.humanShips.find((hs) =>
          c.pointIsInsideCircle(point, hs.location, 0.2),
        )
        if (tooClose) spawnPoint = undefined
        else spawnPoint = point
        radius += 0.1
      }

      const level = c.distance([0, 0], spawnPoint) * 2 + 0.1

      this.addAIShip({
        location: spawnPoint,
        name: `AI${`${Math.random().toFixed(3)}`.substring(
          2,
        )}`,
        species: { id: `robots` },
        level,
      })
    }
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
    c.log(
      `gray`,
      `Adding human ship ${data.name} to game at ${data.location}`,
    )

    data.loadout = `humanDefault`
    const newShip = new HumanShip(data, this)
    this.ships.push(newShip)
    if (save) db.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  addAIShip(data: BaseAIShipData, save = true): AIShip {
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
    c.log(
      `gray`,
      `Adding level ${data.level} AI ship ${data.name} to game at ${data.location}`,
    )

    const newShip = new AIShip(data, this)
    this.ships.push(newShip)
    if (save) db.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  removeShip(ship: Ship) {
    c.log(`Removing ship ${ship.name} from the game.`)
    db.ship.removeFromDb(ship.id)
    if (ship.tutorial) ship.tutorial.cleanUp()
    const index = this.ships.findIndex(
      (ec) => ship.id === ec.id,
    )
    if (index === -1) return
    this.ships.splice(index, 1)
  }

  addPlanet(data: BasePlanetData, save = true): Planet {
    const existing = this.planets.find(
      (p) => p.name === data.name,
    )
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing planet ${existing.name}.`,
      )
      return existing
    }
    const newPlanet = new Planet(data, this)
    this.planets.push(newPlanet)
    if (newPlanet.homeworld)
      newPlanet.homeworld.homeworld = newPlanet
    if (save) db.planet.addOrUpdateInDb(newPlanet)
    return newPlanet
  }

  addFaction(data: BaseFactionData): Faction {
    const newFaction = new Faction(data, this)
    this.factions.push(newFaction)
    return newFaction
  }

  addSpecies(data: BaseSpeciesData): Species {
    const newSpecies = new Species(data, this)
    this.species.push(newSpecies)
    return newSpecies
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
    c.log(`Removing cache ${cache.id} from the game.`)
    db.cache.removeFromDb(cache.id)
    const index = this.caches.findIndex(
      (ec) => cache.id === ec.id,
    )
    if (index === -1)
      return c.log(`Failed to find cache in list.`)
    this.caches.splice(index, 1)
    c.log(this.caches.length, `remaining`)
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
    c.log(`Removing attack remnant ${ar.id} from the game.`)
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
