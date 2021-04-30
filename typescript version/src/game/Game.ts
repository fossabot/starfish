import c from '../common'
import { Ship } from './classes/Ship/Ship'
import { Planet } from './classes/Planet'
import { Cache } from './classes/Cache'
import { Faction } from './classes/Faction'

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

  constructor() {
    this.startTime = new Date()
    this.ships = []
    this.planets = []
    this.caches = []
    this.factions = []

    this.startGame()
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

  startGame() {
    c.log(`----- Starting Game -----`)

    defaultPlanets.forEach((p) => {
      this.addPlanet(p)
    })
    defaultFactions.forEach((f) => {
      this.addFaction(f)
    })

    setInterval(() => this.tick(), c.TICK_INTERVAL)
  }

  // ------------- game loop --------------

  tickCount = 0
  tick() {
    this.tickCount++
    this.ships.forEach((s) => s.tick())
  }

  // ------------- entity functions --------------

  addHumanShip(data: BaseHumanShipData): HumanShip {
    const newShip = new HumanShip(data, this)
    c.log(`Adding human ship ${newShip.name} to game`)
    this.ships.push(newShip)
    return newShip
  }

  addAIShip(data: BaseShipData): AIShip {
    const newShip = new AIShip(data, this)
    c.log(`Adding AI ship ${newShip.name} to game`)
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
}
