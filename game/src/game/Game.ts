import c from '../../../common/dist'

// io/db links
import spawnIo from '../server/io'
import {
  db,
  init as dbInit,
  runOnReady as runOnDbReady,
} from '../db'

// classes
import { Ship } from './classes/Ship/Ship'
import { Planet } from './classes/Planet/Planet'
import { BasicPlanet } from './classes/Planet/BasicPlanet'
import { MiningPlanet } from './classes/Planet/MiningPlanet'
import { Comet } from './classes/Planet/Comet'
import { Cache } from './classes/Cache'
import { AttackRemnant } from './classes/AttackRemnant'
import { Zone } from './classes/Zone'
import { HumanShip } from './classes/Ship/HumanShip/HumanShip'
import { AIShip } from './classes/Ship/AIShip/AIShip'
import { CombatShip } from './classes/Ship/CombatShip'
import { ChunkManager } from './classes/Chunks/ChunkManager'

// presets
import {
  generateBasicPlanet as generateBasicPlanetData,
  generateMiningPlanet as generateMiningPlanetData,
} from './presets/planets'
import { generateComet } from './presets/comets'
import { generateZoneData } from './presets/zones'
import type { Server } from 'socket.io'

export class Game {
  static saveTimeInterval =
    (process.env.NODE_ENV !== `development` ? 10 : 1) *
    60 *
    1000

  readonly createTime = Date.now()
  startTime: number = 0
  readonly ships: Ship[] = []
  readonly planets: Planet[] = []
  readonly comets: Comet[] = []
  readonly caches: Cache[] = []
  readonly zones: Zone[] = []
  readonly attackRemnants: AttackRemnant[] = []

  readonly chunkManager = new ChunkManager()

  settings: AdminGameSettings

  guildRankings: GuildRanking[] = []

  paused: boolean = false
  activePlayers: number = 0

  db: typeof db | null = null
  io: Server<IOClientEvents, IOServerEvents>
  ioPort: number

  constructor(options?: { ioPort?: number }) {
    this.settings = c.defaultGameSettings

    this.ioPort = !options?.ioPort
      ? Math.round(Math.random() * (65536 - 5000)) + 5000
      : options?.ioPort
    this.io = spawnIo(this, { port: this.ioPort })

    // c.log(
    //   `gray`,
    //   `Loaded ${
    //     Object.keys(c.species).length
    //   } species and ${
    //     Object.keys(c.guilds).length
    //   } guilds.`,
    // )
  }

  loadGameDataFromDb(dbSettings: GameDbOptions = {}) {
    if (this.db)
      return c.log(
        `red`,
        `Attempted to double connect game to database`,
      )

    dbInit(dbSettings)

    return new Promise((resolve) => {
      runOnDbReady(async () => {
        this.db = db

        // await this.db.attackRemnant.wipe()
        // await this.db.planet.wipe()
        // await this.db.ship.wipe()
        // await this.db.cache.wipe()
        // await this.db.zone.wipe()
        // await this.db.ship.wipeAI()

        const savedGameData =
          await this.db.gameSettings.getAllConstructible()
        if (savedGameData && savedGameData[0]) {
          c.log(`gray`, `Loaded game settings.`)
          this.setSettings(savedGameData[0])
        } else {
          c.log(
            `gray`,
            `Starting game with default settings.`,
          )
        }

        const savedPlanets =
          await this.db.planet.getAllConstructible()
        c.log(
          `gray`,
          `Loaded ${savedPlanets.length} saved planets (${
            savedPlanets.filter(
              (s) => s.planetType === `basic`,
            ).length
          } basic, ${
            savedPlanets.filter(
              (s) => s.planetType === `mining`,
            ).length
          } mining, ${
            savedPlanets.filter(
              (s) => s.planetType === `comet`,
            ).length
          } comet) from DB.`,
        )
        for (let planet of savedPlanets)
          if (planet.planetType === `basic`)
            await this.addBasicPlanet(
              planet as BaseBasicPlanetData,
              false,
            )
          else if (planet.planetType === `mining`)
            await this.addMiningPlanet(
              planet as BaseMiningPlanetData,
              false,
            )
          else if (planet.planetType === `comet`)
            await this.addComet(
              planet as BaseCometData,
              false,
            )

        const savedCaches =
          await this.db.cache.getAllConstructible()
        c.log(
          `gray`,
          `Loaded ${savedCaches.length} saved caches from DB.`,
        )
        savedCaches.forEach(
          async (cache) =>
            await this.addCache(cache, false),
        )

        const savedZones =
          await this.db.zone.getAllConstructible()
        c.log(
          `gray`,
          `Loaded ${savedZones.length} saved zones from DB.`,
        )
        savedZones.forEach(
          async (zone) => await this.addZone(zone, false),
        )

        const savedShips =
          await this.db.ship.getAllConstructible()
        c.log(
          `gray`,
          `Loaded ${savedShips.length} saved ships (${
            savedShips.filter((s) => !s.ai).length
          } human) from DB.`,
        )
        // savedShips
        //   .filter((s) => !s.ai)
        //   .forEach((s) => c.log('gray', s.id, s.name, s.items, s.chassis))
        for (let ship of savedShips) {
          if (ship.ai)
            await this.addAIShip(
              ship as BaseAIShipData,
              false,
            )
          else
            await this.addHumanShip(
              ship as BaseHumanShipData,
              false,
            )
        }

        const savedAttackRemnants =
          await this.db.attackRemnant.getAllConstructible()
        c.log(
          `gray`,
          `Loaded ${this.attackRemnants.length} saved attack remnants from DB.`,
        )
        savedAttackRemnants.forEach((ar) =>
          this.addAttackRemnant(ar, false),
        )

        resolve(true)
      })
    })
  }

  startGame() {
    c.log(`----- Starting Game -----`)

    this.startTime = Date.now()

    setInterval(() => this.save(), Game.saveTimeInterval)
    setInterval(() => this.daily(), 24 * 60 * 60 * 1000)
    this.daily()

    this.tick()

    this.recalculateGuildRankings()
  }

  async save() {
    if (this.paused) return

    const saveStartTime = Date.now()

    const promises: Promise<any>[] = []
    this.planets.forEach((p) => {
      promises.push(db.planet.addOrUpdateInDb(p))
    })
    this.comets.forEach((p) => {
      promises.push(db.planet.addOrUpdateInDb(p))
    })
    await Promise.all(promises)

    // * we were doing it this way but at a certain point we got a stack overflow (I think this was the cause)
    // this.ships.forEach((s) => {
    //   promises.push(db.ship.addOrUpdateInDb(s))
    // })

    for (let s of this.ships) {
      await this.db?.ship.addOrUpdateInDb(s)
    }

    this.recalculateGuildRankings()

    c.log(
      `gray`,
      `----- Saved Game in ${c.r2(
        (Date.now() - saveStartTime) / 1000,
      )}s -----`,
    )
    c.log(
      `gray`,
      `    - ${this.activePlayers} player${
        this.activePlayers === 1 ? `` : `s`
      } online in the last ${c.msToTimeString(
        c.userIsOfflineTimeout,
      )}`,
    )
    c.log(
      `gray`,
      `    - Tick avg: ${c.r2(
        this.averageTickTime,
        2,
      )}ms, Worst human ship avg: ${c.r2(
        this.averageWorstShipTickLag,
        2,
      )}ms`,
    )
  }

  async daily() {
    if (this.paused) return

    c.log(`gray`, `----- Running Daily Tasks -----`)

    // remove inactive ships
    const inactiveCutoff = 21 * 24 * 60 * 60 * 1000 // 3 weeks
    const tutorialInactiveCutoff = 3 * 24 * 60 * 60 * 1000 // 3 days
    const ic = Date.now() - inactiveCutoff,
      tic = Date.now() - tutorialInactiveCutoff
    for (let inactiveShip of this.humanShips.filter(
      (s) =>
        !s.crewMembers.find((cm) => {
          return (
            cm.lastActive >
            (s.tutorial && s.tutorial.currentStep
              ? tic
              : ic)
          )
        }),
    )) {
      c.log(`Removing inactive ship`, inactiveShip.name)
      this.removeShip(inactiveShip)
    }
  }

  // ----- game loop -----

  tickCount = 0
  private lastTickTime: number = Date.now()
  private averageTickLag: number = 0
  private averageWorstShipTickLag: number = 0
  private averageTickTime: number = 0

  tick() {
    if (this.paused)
      return setTimeout(() => this.tick(), c.tickInterval)

    // c.log(`tick`, Date.now() - this.lastTickTime)

    const tickStartTime = Date.now()

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

    this.planets.forEach((p) => p.tick())
    this.comets.forEach((p) => p.tick())

    this.expireOldAttackRemnantsAndCaches()
    this.spawnNewCaches()
    this.spawnNewAIs()
    this.spawnNewPlanets()
    this.spawnNewComets()
    this.spawnNewZones()

    // ----- timing

    const tickDoneTime = Date.now()

    c.deltaTime = tickDoneTime - this.lastTickTime

    const thisTickLag = c.deltaTime - c.tickInterval
    this.averageTickLag = c.lerp(
      this.averageTickLag,
      thisTickLag,
      0.1,
    )
    const nextTickTime = Math.min(
      c.tickInterval,
      c.tickInterval - this.averageTickLag,
    )
    this.lastTickTime = tickStartTime

    // ----- schedule next tick -----
    setTimeout(() => this.tick(), nextTickTime)

    const elapsedTimeInMs = tickDoneTime - tickStartTime
    // c.log(`Tick: ${c.r2(elapsedTimeInMs)}ms`)
    // if (elapsedTimeInMs > 100) {
    //   if (elapsedTimeInMs < 200)
    //     c.log(
    //       `Tick took`,
    //       `yellow`,
    //       elapsedTimeInMs + ` ms`,
    //     )
    //   else
    //     c.log(`Tick took`, `red`, elapsedTimeInMs + ` ms`)
    // }
    this.averageTickTime = c.lerp(
      this.averageTickTime,
      elapsedTimeInMs,
      0.1,
    )
  }

  // ----- scan function -----
  // todo optimize this with a chunks system
  scanCircle(
    center: CoordinatePair,
    radius: number,
    ignoreSelf: string | null,
    types?: ScanType[],
    includeTrails: boolean | `withColors` = false,
    tutorial: boolean = false,
  ): {
    ships: Ship[]
    trails: { color?: string; points: CoordinatePair[] }[]
    planets: Planet[]
    comets: Comet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
    zones: Zone[]
  } {
    let ships: Ship[] = [],
      trails: {
        color?: string
        points: CoordinatePair[]
      }[] = [],
      planets: Planet[] = [],
      comets: Comet[] = [],
      caches: Cache[] = [],
      attackRemnants: AttackRemnant[] = [],
      zones: Zone[] = []

    const visible =
      this.chunkManager.getElementsWithinRadius(
        center,
        radius,
      )

    if (!types || types.includes(`humanShip`))
      ships.push(
        ...(
          visible.filter(
            (s) =>
              s.type === `ship` &&
              !s.dead &&
              s.ai === false,
          ) as HumanShip[]
        ).filter((s) => {
          if (
            s.onlyVisibleToShipId &&
            ((ignoreSelf &&
              s.onlyVisibleToShipId !== ignoreSelf) ||
              !ignoreSelf)
          )
            return false
          if (tutorial && !s.onlyVisibleToShipId)
            return false
          if (
            s.tutorial &&
            s.id !== ignoreSelf &&
            !tutorial
          )
            return false
          if (s.id === ignoreSelf) return false
          if (
            c.pointIsInsideCircle(
              center,
              s.location,
              radius,
            )
          )
            return true
          return false
        }),
      )
    if (!types || types.includes(`aiShip`))
      ships.push(
        ...(
          visible.filter(
            (s) =>
              s.type === `ship` && !s.dead && s.ai === true,
          ) as AIShip[]
        ).filter((s) => {
          if (
            s.onlyVisibleToShipId &&
            ((ignoreSelf &&
              s.onlyVisibleToShipId !== ignoreSelf) ||
              !ignoreSelf)
          )
            return false
          if (tutorial && !s.onlyVisibleToShipId)
            return false
          if (
            s.tutorial &&
            s.id !== ignoreSelf &&
            !tutorial
          )
            return false
          if (s.id === ignoreSelf) return false
          if (
            c.pointIsInsideCircle(
              center,
              s.location,
              radius,
            )
          )
            return true
          return false
        }),
      )

    if (
      (!types || types.includes(`trail`)) &&
      includeTrails
    ) {
      const showColors = includeTrails === `withColors`
      trails = (
        visible.filter(
          (s) => s.type === `ship` && !s.dead,
        ) as Ship[]
      )
        .filter((s) => {
          if (tutorial) return false
          if (s.tutorial) return false
          if (s.id === ignoreSelf) return false
          if (ships.find((ship) => ship === s)) return false
          for (let l of s.previousLocations) {
            if (c.pointIsInsideCircle(center, l, radius))
              return true
          }
          return false
        })
        .map((s) => {
          return {
            color:
              showColors && s.guildId
                ? c.guilds[s.guildId].color
                : undefined,
            points: [
              ...s.previousLocations,
              s.location,
            ] as CoordinatePair[],
          }
        })

      trails.push(
        ...this.comets
          .filter((s) => {
            for (let l of s.trail) {
              if (c.pointIsInsideCircle(center, l, radius))
                return true
            }
            return false
          })
          .map((s) => {
            return {
              color: s.color,
              points: [
                ...s.trail,
                s.location,
              ] as CoordinatePair[],
            }
          }),
      )
    }
    if (!types || types.includes(`planet`))
      planets = (
        visible.filter(
          (s) =>
            s.type === `planet` && s.planetType !== `comet`,
        ) as Planet[]
      ).filter((p) =>
        c.pointIsInsideCircle(center, p.location, radius),
      )
    if (!types || types.includes(`comet`))
      comets = (
        visible.filter(
          (s) =>
            s.type === `planet` && s.planetType === `comet`,
        ) as Comet[]
      ).filter((p) =>
        c.pointIsInsideCircle(center, p.location, radius),
      )
    if (!types || types.includes(`cache`))
      caches = (
        visible.filter((s) => s.type === `cache`) as Cache[]
      ).filter((k) => {
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
      attackRemnants = (
        visible.filter(
          (s) => s.type === `attackRemnant`,
        ) as AttackRemnant[]
      ).filter((a) => {
        if (
          a.onlyVisibleToShipId &&
          ignoreSelf &&
          a.onlyVisibleToShipId !== ignoreSelf
        )
          return false
        return (
          c.pointIsInsideCircle(center, a.start, radius) ||
          c.pointIsInsideCircle(center, a.end, radius)
        )
      })
    if (!types || types.includes(`zone`))
      zones = (
        visible.filter((s) => s.type === `zone`) as Zone[]
      ).filter((z) => {
        return (
          c.distance(center, z.location) - z.radius <=
          radius
        )
      })

    return {
      ships,
      trails,
      planets,
      comets,
      caches,
      attackRemnants,
      zones,
    }
  }

  setSettings(newSettings: Partial<AdminGameSettings>) {
    const defaultSettings = c.defaultGameSettings
    this.settings = {
      ...defaultSettings,
      ...this.settings,
      ...newSettings,
    }
    for (let key of Object.keys(this.settings))
      if (!defaultSettings[key]) delete this.settings[key]
    this.db?.gameSettings.addOrUpdateInDb(this.settings)
  }

  // ----- radii -----

  get gameSoftRadius() {
    const count =
      this.humanShips.filter(
        (s) => !s.tutorial?.currentStep,
      ).length || 1
    return Math.max(5, Math.sqrt(count) * 2)
  }

  get gameSoftArea() {
    return Math.PI * this.gameSoftRadius ** 2
  }

  // ----- tick helpers -----

  expireOldAttackRemnantsAndCaches() {
    const attackRemnantExpirationTime =
      Date.now() - c.attackRemnantExpireTime
    this.attackRemnants.forEach((ar, index) => {
      if (attackRemnantExpirationTime > ar.time) {
        this.removeAttackRemnant(ar)
      }
    })

    const cacheExpirationTime =
      Date.now() - c.cacheExpireTime
    this.caches.forEach((c, index) => {
      if (cacheExpirationTime > c.time) {
        this.removeCache(c)
      }
    })
  }

  async spawnNewPlanets() {
    while (
      this.planets.length <
        this.gameSoftArea * this.settings.planetDensity ||
      this.planets.length < Object.keys(c.guilds).length - 1
    ) {
      const weights: {
        weight: number
        value: PlanetType
      }[] = [
        { weight: 0.6, value: `basic` },
        { weight: 0.35, value: `mining` },
      ]
      const selection = c.randomWithWeights(weights)
      // ----- basic planet -----
      if (selection === `basic`) {
        const guildThatNeedsAHomeworld = Object.values(
          c.guilds,
        ).find(
          (f) =>
            f.id !== `fowl` &&
            !this.planets.find(
              (p) =>
                p.planetType === `basic` &&
                (p as BasicPlanet).homeworld === f.id,
            ),
        )
        const p = generateBasicPlanetData(
          this,
          guildThatNeedsAHomeworld?.id,
        )
        if (!p) continue
        const planet = await this.addBasicPlanet(p)
        c.log(
          `gray`,
          `Spawned basic planet ${
            planet.name
          } at ${planet.location
            .map((l) => c.r2(l))
            .join(`, `)}${
            guildThatNeedsAHomeworld
              ? ` (${guildThatNeedsAHomeworld.id} guild homeworld)`
              : ``
          }.`,
        )
        // c.log(this.planets.map((p) => p.vendor.items))
        // c.log(this.planets.map((p) => p.vendor.chassis))
        // c.log(this.planets.map((p) => p.vendor.cargo))
        // c.log(this.planets.map((p) => p.priceFluctuator))
      } else if (selection === `mining`) {
        const p = generateMiningPlanetData(this)
        if (!p) continue
        const planet = await this.addMiningPlanet(p)
        c.log(
          `gray`,
          `Spawned mining planet ${
            planet.name
          } at ${planet.location
            .map((l) => c.r2(l))
            .join(`, `)}.`,
        )
      }
    }
  }

  async spawnNewComets() {
    while (
      this.comets.length <
        this.gameSoftArea * this.settings.cometDensity ||
      this.comets.length < 1
    ) {
      const p = generateComet(this)
      if (!p) continue
      const comet = await this.addComet(p)
      c.log(
        `gray`,
        `Spawned comet ${comet.name} at ${comet.location
          .map((l) => c.r2(l))
          .join(`, `)} traveling at ${c.r2(
          c.vectorToDegrees(comet.velocity),
        )} degrees.`,
      )
    }
  }

  async spawnNewZones() {
    while (
      this.zones.length <
      this.gameSoftArea * this.settings.zoneDensity
    ) {
      const z = generateZoneData(this)
      if (!z) return
      const zone = await this.addZone(z)
      c.log(
        `gray`,
        `Spawned zone ${zone.name} at ${zone.location.map(
          (l) => c.r2(l),
        )} of radius ${c.r2(
          zone.radius,
        )} and intensity ${c.r2(
          zone.effects[0].intensity,
        )}.`,
      )
    }
  }

  spawnNewCaches() {
    while (
      this.caches.length <
      this.gameSoftArea * this.settings.cacheDensity
    ) {
      const id = c.randomFromArray([
        ...Object.keys(c.cargo),
        `credits`,
      ]) as `credits` | CargoId

      const location = c.randomInsideCircle(
        this.gameSoftRadius,
      )

      const amount = c.r2(
        (id === `credits`
          ? Math.round(Math.random() * 1000 + 200)
          : Math.round(Math.random() * 3 + 4)) *
          (c.distance([0, 0], location) / 2 + 1),
        0,
      )

      const message =
        Math.random() > 0.9
          ? c.randomFromArray([
              `Your lack of fear is based on your ignorance.`,
              `Rationality was powerless.`,
              `Time is the cruelest force of all.`,
              `“We'll send only a brain," he said.`,
              `Fate lies within the light cone.`,
              `The universe is but a corpse puffing up.`,
              `It's easy to be led to the abyss.`,
              `In fundamental theory, one must be stupid.`,
              `Let's go drinking.`,
              `Go back to sleep like good bugs.`,
              `Any planet is 'Earth' to those that live on it.`,
              `The easiest way to solve a problem is to deny it exists.`,
              `It pays to be obvious.`,
              `All evil is good become cancerous.`,
              `I've no sympathy at all.`,
              `Theft is property.`,
              `Pretend that you have free will.`,
            ])
          : undefined
      this.addCache({
        contents: [
          {
            id,
            amount,
          },
        ],
        location,
        message,
      })
      c.log(
        `gray`,
        `Spawned random cache of ${amount} ${id} at ${location}.`,
      )
    }
  }

  spawnNewAIs() {
    while (
      this.ships.length &&
      this.aiShips.length <
        this.gameSoftArea * this.settings.aiShipDensity
    ) {
      let radius = this.gameSoftRadius
      let spawnPoint: CoordinatePair | undefined
      while (!spawnPoint) {
        let point = c.randomInsideCircle(radius)
        // c.log(point)
        const tooClose = this.humanShips.find((hs) =>
          c.pointIsInsideCircle(point, hs.location, 0.1),
        )
        if (tooClose) spawnPoint = undefined
        else spawnPoint = point
        radius += 0.1
      }

      const isInSafeZone =
        c.distance([0, 0], spawnPoint) <
        this.settings.safeZoneRadius
      const level =
        c.distance([0, 0], spawnPoint) *
          2 *
          Number(isInSafeZone ? 0.5 : 1) +
        1
      const species = c.randomFromArray(
        Object.values(c.species)
          .filter((s) => s.aiOnly)
          .map((s) => s.id),
      ) as SpeciesId

      this.addAIShip({
        location: spawnPoint,
        name: `${c.capitalize(
          species.substring(0, species.length - 1),
        )}${`${Math.random().toFixed(3)}`.substring(2)}`,
        guildId: `fowl`,
        speciesId: species,
        level,
      })
    }
  }

  // ----- entity functions -----

  async addHumanShip(
    data: BaseHumanShipData,
    save = true,
  ): Promise<HumanShip> {
    const existing = this.ships.find(
      (s) => s instanceof HumanShip && s.id === data.id,
    ) as HumanShip
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing human ship ${existing.name} (${existing.id}).`,
      )
      this.db?.ship.removeByUnderscoreId((data as any)._id)
      return existing
    }
    // c.log(
    //   `gray`,
    //   `Adding human ship ${data.name} to game at ${data.location}`,
    // )

    data.loadout = data.loadout || `humanDefault`
    const newShip = new HumanShip(data, this)
    this.ships.push(newShip)
    this.chunkManager.addOrUpdate(newShip)
    if (save) await this.db?.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  async addAIShip(
    data: BaseAIShipData,
    save = true,
  ): Promise<AIShip> {
    const existing = this.ships.find(
      (s) => s && s instanceof AIShip && s.id === data.id,
    ) as AIShip | undefined
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing ai ship ${existing.name} (${existing.id}).`,
      )
      return existing
    }
    // c.log(
    //   `gray`,
    //   `Adding level ${data.level} AI ship ${data.name} to game at ${data.location}`,
    // )

    const newShip = new AIShip(data, this)
    this.ships.push(newShip)
    this.chunkManager.addOrUpdate(newShip)
    if (save) await this.db?.ship.addOrUpdateInDb(newShip)
    return newShip
  }

  async removeShip(ship: Ship | string) {
    if (typeof ship === `string`) {
      const foundShip = this.ships.find(
        (s) => s.id === ship,
      )
      if (!foundShip) {
        c.log(
          `red`,
          `Attempted to remove a ship that does not exist from the game.`,
          ship,
        )
        return
      }
      ship = foundShip
    }
    // remove all tutorial ships for members of this ship
    for (let cm of ship.crewMembers) {
      if (cm.tutorialShipId) {
        const tutorialShip = this.ships.find(
          (s) => s.id === cm.tutorialShipId,
        )
        if (tutorialShip) {
          // c.log(`Removing excess tutorial ship`)
          await tutorialShip.tutorial?.cleanUp()
        }
      }
    }

    this.ships
      .filter((s) => s instanceof CombatShip)
      .forEach((s) => {
        if ((s as CombatShip).targetShip === ship)
          (s as CombatShip).targetShip = null
      })

    // c.log(
    //   `Removing ship ${ship.name} (${ship.id}) from the game.`,
    // )
    await this.db?.ship.removeFromDb(ship.id)

    const index = this.ships.findIndex(
      (ec) => (ship as Ship).id === ec.id,
    )
    if (index === -1) return
    this.ships.splice(index, 1)

    this.chunkManager.remove(ship)

    if (!ship.tutorial)
      ship.crewMembers.forEach((cm) => {
        this.io.to(`user:${cm.id}`).emit(`user:reloadShips`)
      })

    ship.tutorial?.cleanUp()

    // c.log(
    //   this.humanShips.length,
    //   (
    //     await (
    //       await this.db?.ship.getAllConstructible()
    //     ).filter((s) => s.ai === false)
    //   ).map((s) => s.id),
    // )
  }

  async addBasicPlanet(
    data: BaseBasicPlanetData,
    save = true,
  ): Promise<Planet> {
    const existing = this.planets.find(
      (p) => p.id === data.id,
    )
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing planet ${existing.name}.`,
      )
      return existing
    }
    const newPlanet = await new BasicPlanet(
      data as BaseBasicPlanetData,
      this,
    )
    this.planets.push(newPlanet)

    this.chunkManager.addOrUpdate(newPlanet)

    if (`homeworld` in newPlanet && newPlanet.homeworld) {
      ;(newPlanet as BasicPlanet).homeworld =
        newPlanet.guildId
      ;(newPlanet as BasicPlanet).guildId =
        newPlanet.guildId
    }

    if (save)
      await this.db?.planet.addOrUpdateInDb(newPlanet)
    return newPlanet
  }

  async addMiningPlanet(
    data: BaseMiningPlanetData,
    save = true,
  ) {
    const existing = this.planets.find(
      (p) => p.id === data.id,
    )
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing planet ${existing.name}.`,
      )
      return existing
    }
    const newPlanet = await new MiningPlanet(
      data as BaseMiningPlanetData,
      this,
    )
    this.planets.push(newPlanet)

    this.chunkManager.addOrUpdate(newPlanet)

    if (save)
      await this.db?.planet.addOrUpdateInDb(newPlanet)
    return newPlanet
  }

  async addComet(
    data: BaseCometData,
    save = true,
  ): Promise<Comet> {
    const existing = this.comets.find(
      (p) => p.id === data.id,
    ) as Comet
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing comet ${existing.name}.`,
      )
      return existing
    }
    const newComet = await new Comet(data, this)
    this.comets.push(newComet)

    this.chunkManager.addOrUpdate(newComet)

    if (save)
      await this.db?.planet.addOrUpdateInDb(newComet)
    return newComet
  }

  async removePlanet(planet: Planet) {
    c.log(`Removing planet ${planet.name} from the game.`)
    this.humanShips.forEach((hs) => {
      const seenThisPlanet = hs.seenPlanets.findIndex(
        (lm) => lm.type === `planet` && lm.id === planet.id,
      )
      if (seenThisPlanet !== -1) {
        hs.seenPlanets.splice(seenThisPlanet, 1)
        hs.toUpdate.seenPlanets = hs.seenPlanets.map((z) =>
          z.toVisibleStub(),
        )
      }
    })
    this.chunkManager.remove(planet)

    let index = this.planets.findIndex(
      (z) => planet.id === z.id,
    )
    if (index !== -1) this.planets.splice(index, 1)

    index = this.comets.findIndex((z) => planet.id === z.id)
    if (index !== -1) this.comets.splice(index, 1)

    planet.shipsAt.forEach((s) => {
      s.updateVisible()
      s.updatePlanet(true)
    })

    await this.db?.planet.removeFromDb(planet.id)
  }

  async addCache(
    data: BaseCacheData,
    save = true,
  ): Promise<Cache> {
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
    this.chunkManager.addOrUpdate(newCache)
    // c.log(`adding`, newCache)

    if (save) await this.db?.cache.addOrUpdateInDb(newCache)
    return newCache
  }

  async removeCache(cache: Cache) {
    c.log(`Removing cache ${cache.id} from the game.`)
    const index = this.caches.findIndex(
      (ec) => cache.id === ec.id,
    )
    if (index === -1)
      return c.log(`Failed to find cache in list.`)
    this.caches.splice(index, 1)
    this.chunkManager.remove(cache)
    await this.db?.cache.removeFromDb(cache.id)
    // c.log(this.caches.length, `remaining`)
  }

  async addZone(
    data: BaseZoneData,
    save = true,
  ): Promise<Zone> {
    const existing = this.zones.find(
      (zone) => zone.id === data.id,
    )
    if (existing) {
      c.log(
        `red`,
        `Attempted to add existing zone (${existing.id}).`,
      )
      return existing
    }
    const newZone = new Zone(data, this)
    this.zones.push(newZone)
    this.chunkManager.addOrUpdate(newZone)

    if (save) await this.db?.zone.addOrUpdateInDb(newZone)
    return newZone
  }

  async removeZone(zone: Zone) {
    c.log(`Removing zone ${zone.name} from the game.`)
    this.humanShips.forEach((hs) => {
      const seenThisZone = hs.seenLandmarks.findIndex(
        (lm) => lm.type === `zone` && lm.id === zone.id,
      )
      if (seenThisZone !== -1) {
        hs.seenLandmarks.splice(seenThisZone, 1)
        hs.toUpdate.seenLandmarks = hs.seenLandmarks.map(
          (z) => z.toVisibleStub(),
        )
      }
    })
    this.chunkManager.remove(zone)
    const index = this.zones.findIndex(
      (z) => zone.id === z.id,
    )
    if (index === -1) return
    this.zones.splice(index, 1)
    await this.db?.zone.removeFromDb(zone.id)
  }

  async addAttackRemnant(
    data: BaseAttackRemnantData,
    save = true,
  ): Promise<AttackRemnant | undefined> {
    if (!data.attacker?.id || !data.defender?.id) {
      c.log(
        `Missing attacker or defender id while trying to spawn attack remnant.`,
        data,
      )
      return
    }
    const newAttackRemnant = new AttackRemnant(data)
    this.attackRemnants.push(newAttackRemnant)
    this.chunkManager.addOrUpdate(newAttackRemnant)

    if (save)
      await this.db?.attackRemnant.addOrUpdateInDb(
        newAttackRemnant,
      )
    return newAttackRemnant
  }

  async removeAttackRemnant(ar: AttackRemnant) {
    // c.log(`Removing attack remnant ${ar.id} from the game.`)
    const index = this.attackRemnants.findIndex(
      (eAr) => ar.id === eAr.id,
    )
    if (index === -1) return
    this.attackRemnants.splice(index, 1)
    this.chunkManager.remove(ar)
    await this.db?.attackRemnant.removeFromDb(ar.id)
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

  get basicPlanets(): BasicPlanet[] {
    return this.planets.filter(
      (p) => p instanceof BasicPlanet,
    ) as BasicPlanet[]
  }

  get miningPlanets(): MiningPlanet[] {
    return this.planets.filter(
      (p) => p instanceof MiningPlanet,
    ) as MiningPlanet[]
  }

  getHomeworld(guildId?: GuildId): BasicPlanet | undefined {
    if (!guildId) return
    return this.basicPlanets.find(
      (p) => p.guildId === guildId && p.homeworld,
    )
  }

  resetHomeworlds() {
    this.basicPlanets
      .filter((p) => p.guildId)
      .forEach((p) => {
        c.log(
          `${p.name} is no longer ${p.guildId}'s homeworld`,
        )
        p.guildId = undefined
        p.homeworld = undefined
        p.resetLevels(true)
        p.color = `hsl(${Math.round(
          Math.random() * 360,
        )}, ${Math.round(Math.random() * 80 + 20)}%, ${
          Math.round(Math.random() * 40) + 40
        }%)`
      })

    for (let guildId of Object.keys(c.guilds).filter(
      (g) => g !== `fowl`,
    ) as GuildId[]) {
      const newHomeworld = c.randomFromArray(
        this.basicPlanets.filter(
          (p) =>
            !p.guildId &&
            c.distance([0, 0], p.location) <
              this.settings.safeZoneRadius,
        ),
      )
      newHomeworld.guildId = guildId
      newHomeworld.homeworld = guildId
      newHomeworld.resetLevels(true)
      newHomeworld.color = c.guilds[guildId].color
      c.log(
        `${newHomeworld.name} is now ${newHomeworld.guildId}'s homeworld`,
      )
    }
  }

  recalculateGuildRankings() {
    // netWorth
    let topNetWorthShips: GuildRankingTopEntry[] = []
    const netWorthScores: GuildRankingScoreEntry[] = []
    for (let guild of Object.values(c.guilds)) {
      if (guild.id === `fowl`) continue
      let total = 0
      this.humanShips
        .filter((s) => s.guildId === guild.id)
        .filter((s) => !s.tutorial)
        .forEach((s) => {
          let shipTotal =
            (s as HumanShip).commonCredits || 0
          for (let cm of (s as HumanShip).crewMembers) {
            shipTotal += cm.credits
          }
          for (let b of (s as HumanShip).banked)
            shipTotal += b.amount
          for (let i of (s as HumanShip).items) {
            shipTotal +=
              (c.items[i.type][i.id] as BaseItemData)
                .basePrice.credits || 0
          }
          s.setStat(`netWorth`, shipTotal)
          s.checkAchievements(`money`)
          topNetWorthShips.push({
            name: s.name,
            color: guild.color,
            score: shipTotal,
          })

          total += shipTotal
        })
      netWorthScores.push({
        guildId: guild.id,
        score: total,
      })
    }
    let noGuildTotal = 0
    this.humanShips
      .filter((s) => !s.guildId)
      .filter((s) => !s.tutorial)
      .forEach((s) => {
        let shipTotal = (s as HumanShip).commonCredits || 0
        for (let cm of (s as HumanShip).crewMembers) {
          shipTotal += cm.credits
        }
        for (let b of (s as HumanShip).banked)
          shipTotal += b.amount
        for (let i of (s as HumanShip).items) {
          shipTotal +=
            (c.items[i.type][i.id] as BaseItemData)
              .basePrice.credits || 0
        }
        s.setStat(`netWorth`, shipTotal)
        s.checkAchievements(`money`)
        topNetWorthShips.push({
          name: s.name,
          color: `var(--noguild)`,
          score: shipTotal,
        })

        noGuildTotal += shipTotal
      })
    netWorthScores.push({
      guildId: `noGuild`,
      score: noGuildTotal,
    })
    topNetWorthShips = topNetWorthShips
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // control
    const controlScores: GuildRankingScoreEntry[] = []
    for (let guild of Object.values(c.guilds)) {
      if (guild.id === `fowl`) continue
      controlScores.push({
        guildId: guild.id,
        score: 0,
      })
    }
    for (let planet of this.basicPlanets) {
      planet.allegiances.forEach((a) => {
        if (a.guildId === `fowl`) return
        const found = controlScores.find(
          (s) => s.guildId === a.guildId,
        )
        if (!found) return
        found.score += a.level
        c.log(`planet with allegiance:`, planet.name, a) // todo remove
      })
    }
    c.log(controlScores)

    // members
    let topMembersShips: GuildRankingTopEntry[] = []
    const membersScores: GuildRankingScoreEntry[] = []
    for (let guild of Object.values(c.guilds)) {
      if (guild.id === `fowl`) continue
      let total = 0
      this.humanShips
        .filter((s) => s.guildId === guild.id)
        .filter((s) => !s.tutorial)
        .forEach((s) => {
          let shipTotal =
            (s as HumanShip).crewMembers.length || 0
          topMembersShips.push({
            name: s.name,
            color: guild.color,
            score: shipTotal,
          })
          total += shipTotal
        })
      membersScores.push({
        guildId: guild.id,
        score: total,
      })
    }
    let noGuildMembersTotal = 0
    this.humanShips
      .filter((s) => !s.guildId)
      .filter((s) => !s.tutorial)
      .forEach((s) => {
        let shipTotal =
          (s as HumanShip).crewMembers.length || 0
        topMembersShips.push({
          name: s.name,
          color: `var(--noguild)`,
          score: shipTotal,
        })
        noGuildMembersTotal += shipTotal
      })
    membersScores.push({
      guildId: `noGuild`,
      score: noGuildMembersTotal,
    })
    topMembersShips = topMembersShips
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    this.guildRankings = [
      {
        category: `netWorth`,
        scores: netWorthScores.sort(
          (a, b) => b.score - a.score,
        ),
        top: topNetWorthShips,
      },
      {
        category: `control`,
        scores: controlScores.sort(
          (a, b) => b.score - a.score,
        ),
      },
      {
        category: `members`,
        scores: membersScores.sort(
          (a, b) => b.score - a.score,
        ),
        top: topMembersShips,
      },
    ]

    // c.log(JSON.stringify(this.guildRankings, null, 2))

    this.humanShips.forEach(
      (hs) =>
        (hs.toUpdate.guildRankings = this.guildRankings),
    )
  }

  toAdminMapData(): AdminVisibleData {
    // const startTime = Date.now()
    const mapData = {
      planets: this.planets.map((p) => p.toAdminStub()),
      comets: this.comets.map((c) => c.toAdminStub()),
      ships: this.ships.map((s) => s.toAdminStub()),
      caches: this.caches.map((c) => c.toAdminStub()),
      zones: this.zones.map((z) => z.toAdminStub()),
      attackRemnants: this.attackRemnants.map((a) =>
        a.toAdminStub(),
      ),
      gameRadius: this.gameSoftRadius,
      safeZoneRadius: this.settings.safeZoneRadius,
      showAll: true as true,
    }
    // c.log(
    //   `Generated full game map data in ${
    //     Date.now() - startTime
    //   }ms`,
    // )
    return mapData
  }
}
