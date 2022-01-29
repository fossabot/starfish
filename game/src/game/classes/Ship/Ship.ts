import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Planet } from '../Planet/Planet'
import type { Cache } from '../Cache'
import type { Zone } from '../Zone'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'
import type { HumanShip } from './HumanShip/HumanShip'

import type { Item } from './Item/Item'
import { Engine } from './Item/Engine'
import { Weapon } from './Item/Weapon'
import { Scanner } from './Item/Scanner'
import { Communicator } from './Item/Communicator'
import { Armor } from './Item/Armor'

import { Stubbable } from '../Stubbable'
import type { Tutorial } from './HumanShip/Tutorial'

export class Ship extends Stubbable {
  static maxPreviousLocations: number = 300
  static maxAIPreviousLocations: number = 50
  static notifyWhenHealthDropsToPercent: number = 0.15

  readonly type = `ship`
  name: string
  planet: Planet | false = false
  guildId?: GuildId
  readonly game?: Game
  readonly radii: {
    sight: number
    scan: number
    broadcast: number
    gameSize: number
    safeZone: number
    attack: number[]
  } = {
    sight: 0,
    broadcast: 0,
    scan: 0,
    attack: [],
    gameSize: 0,
    safeZone: 0,
  }

  spawnedAt: number

  onlyVisibleToShipId?: string

  ai: boolean
  human: boolean
  readonly crewMembers: CrewMember[] = []
  tutorial: Tutorial | undefined

  toUpdate: Partial<ShipStub> = {}
  visible: {
    ships: Ship[] | Partial<ShipStub>[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: (AttackRemnant | AttackRemnantStub)[]
    trails?: {
      color?: string
      points: PreviousLocation[]
    }[]
    zones: Zone[]
  } = {
    ships: [],
    planets: [],
    caches: [],
    attackRemnants: [],
    zones: [],
  }

  readonly seenPlanets: Planet[] = []
  readonly seenLandmarks: Zone[] = []
  chassis: BaseChassisData
  items: Item[] = []
  previousLocations: PreviousLocation[] = []
  id = `${Math.random()}`.substring(2) // re-set in subclasses
  location: CoordinatePair = [0, 0]
  velocity: CoordinatePair = [0, 0]
  speed: number = 0 // just for frontend reference
  direction: number = 0 // just for frontend reference
  // targetLocation: CoordinatePair = [0, 0]
  tagline: string | null = null
  headerBackground: string | null = null
  availableTaglines: string[] = []
  availableHeaderBackgrounds: {
    id: string
    url: string
  }[] = []

  achievements: string[] = []
  passives: ShipPassiveEffect[] = []
  timedPassives: ShipPassiveEffect[] = []
  slots: number = 1
  attackable = false
  _hp = 10 // set in hp setter below
  _maxHp = 10
  dead = false // set in hp setter below
  obeysGravity = true
  mass = 10000
  stats: ShipStatEntry[] = []

  debugLocations: {
    point: CoordinatePair
    label?: string
  }[] = []

  constructor(
    {
      id,
      name,
      guildId,
      spawnedAt,
      chassis,
      items,
      loadout,
      seenPlanets,
      seenLandmarks,
      location,
      velocity,
      previousLocations,
      tagline,
      achievements,
      headerBackground,
      stats,
      timedPassives,
    }: BaseShipData = {} as any,
    game?: Game,
  ) {
    super()
    if (game) this.game = game
    this.id = id || `ship${Math.random()}`.substring(2)
    this.name = name
    this.rename(name)

    this.ai = true
    this.human = false

    this.spawnedAt = spawnedAt || Date.now()

    this.velocity = [velocity?.[0] || 0, velocity?.[1] || 0]
    if (
      location &&
      location[0] !== undefined &&
      !isNaN(location[0]) &&
      location[0] !== null
    ) {
      this.location = location
    }
    // if new guild member, spawn at homeworld
    else if (guildId) {
      this.location = [
        ...(this.game?.getHomeworld(guildId)?.location || [0, 0]),
      ].map(
        (pos) =>
          pos +
          c.randomBetween(
            (this.game?.settings.arrivalThreshold ||
              c.defaultGameSettings.arrivalThreshold) * -0.4,
            (this.game?.settings.arrivalThreshold ||
              c.defaultGameSettings.arrivalThreshold) * 0.4,
          ),
      ) as CoordinatePair
      // c.log(`fact`, this.location, this.guild.homeworld)
    }
    // if new and no guild, spawn at random non-homeworld safe planet
    else
      this.location = [
        ...((c
          .randomFromArray(
            this.game?.planets.filter(
              (p) =>
                !p.homeworld &&
                p.pacifist &&
                c.distance([0, 0], p.location) <
                  (this.game?.settings.safeZoneRadius ||
                    c.defaultGameSettings.safeZoneRadius),
            ) || [],
          )
          ?.location.map(
            (pos) =>
              pos +
              c.randomBetween(
                (this.game?.settings.arrivalThreshold ||
                  c.defaultGameSettings.arrivalThreshold) * -0.4,
                (this.game?.settings.arrivalThreshold ||
                  c.defaultGameSettings.arrivalThreshold) * 0.4,
              ),
          ) as CoordinatePair) || [0, 0]),
      ]

    if (previousLocations && !Array.isArray(previousLocations[0]))
      this.previousLocations = [...previousLocations]

    if (tagline) this.tagline = tagline
    if (headerBackground) this.headerBackground = headerBackground

    if (seenPlanets)
      this.seenPlanets = seenPlanets
        .map(({ id, name }: { id: string; name?: string }) =>
          this.game?.planets.find(
            (p) => p.id === id || (p.name && p.name === name),
          ),
        )
        .filter((p) => p) as Planet[]

    if (seenLandmarks)
      this.seenLandmarks = seenLandmarks
        .filter((l: any) => l?.type === `zone`)
        .map(({ id }: { id: string }) =>
          this.game?.zones.find((z) => z.id === id),
        )
        .filter((z: Zone | undefined) => z) as Zone[]

    this.chassis = c.items.chassis.starter1 // this is just here to placate typescript, chassis is definitely assigned

    // todo remove, temporary
    if (chassis && (chassis as any).id) chassis.chassisId = (chassis as any).id

    if (chassis && chassis.chassisId && c.items.chassis[chassis.chassisId])
      this.swapChassis(c.items.chassis[chassis.chassisId])
    else if (loadout && c.items.chassis[c.loadouts[loadout]?.chassisId])
      this.swapChassis(c.items.chassis[c.loadouts[loadout].chassisId])
    else this.swapChassis(c.items.chassis.starter1)

    this.updateSlots()

    if (items) items.forEach((i) => this.addItem(i))
    if (!items && loadout) this.equipLoadout(loadout)

    this.updateSightAndScanRadius()
    this.recalculateMaxHp()
    this._hp = this.hp

    if (stats) this.stats = [...stats]

    if (guildId && c.guilds[guildId]) this.changeGuild(guildId)

    if (timedPassives?.length) {
      for (let p of timedPassives) {
        this.timedPassives.push(p)
        this.applyPassive(p)
      }
    }
    this.checkExpiredPassives()

    // passively lose previous locations over time
    setInterval(() => {
      if (!this.previousLocations.length) return
      while (
        this.previousLocations[0]?.time <
        Date.now() - c.previousLocationTimeout
      )
        this.previousLocations.shift()
    }, c.tickInterval * 10)
  }

  tick() {
    this.debugLocations = []
    this._stub = null // invalidate stub
    if (this.dead) return
    this.checkExpiredPassives()
    if (this.obeysGravity) this.applyTickOfGravity()
    // c.log(`tick`, this.name)
  }

  rename(newName: string) {
    const prevName = this.name
    this.name = c.sanitize(newName).result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0) this.name = `ship`

    if (this.name === prevName) return

    // if (this.name)
    //   c.log(`renaming ship:`, prevName, newName, this.name)

    this.toUpdate.name = this.name
    this.logEntry(
      [
        `Ship renamed to`,
        { color: `var(--success)`, text: this.name },
        `&nospace!`,
      ],
      `high`,
      `ship`,
      true,
    )
  }

  changeGuild(this: Ship, id: GuildId) {
    // if there already was one, remove its passives
    if (this.guildId) {
      for (let p of c.guilds[this.id].passives) this.removePassive(p)
    }

    if (c.guilds[id]) {
      this.guildId = id
      this.toUpdate.guildId = id
      for (let p of c.guilds[id].passives) this.applyPassive(p)

      if (this.human) (this as HumanShip).checkAchievements(`guild`)

      this.logEntry(
        [
          `${this.name} joined the`,
          {
            color: c.guilds[id].color,
            text: c.guilds[id].name + ` Guild`,
          },
          `&nospace!`,
        ],
        `critical`,
        `flag`,
        true,
      )

      if (this.planet)
        this.planet.shipsAt
          .filter((s) => s.guildId === this.guildId)
          .forEach((s) => {
            if (s === (this as any) || !s.planet) return
            s.logEntry(
              [
                {
                  text: this.name,
                  color: this.guildId && c.guilds[this.guildId].color,
                  tooltipData: this.toReference() as any,
                },
                `joined the`,
                {
                  color: c.guilds[id].color,
                  text: c.guilds[id].name + ` Guild`,
                },
                `&nospace!`,
              ],
              `low`,
              `flag`,
              true,
            )
          })
    }
  }

  // ----- item mgmt -----

  get engines(): Engine[] {
    return this.items.filter((i) => i instanceof Engine) as Engine[]
  }

  get manualEngines(): Engine[] {
    return this.engines.filter((i) => i.manualThrustMultiplier) as Engine[]
  }

  get passiveEngines(): Engine[] {
    return this.engines.filter((i) => i.passiveThrustMultiplier) as Engine[]
  }

  get weapons(): Weapon[] {
    return this.items.filter((i) => i instanceof Weapon) as Weapon[]
  }

  get scanners(): Scanner[] {
    return this.items.filter((i) => i instanceof Scanner) as Scanner[]
  }

  get communicators(): Communicator[] {
    return this.items.filter((i) => i instanceof Communicator) as Communicator[]
  }

  get armor(): Armor[] {
    return this.items.filter((i) => i instanceof Armor) as Armor[]
  }

  swapChassis(this: Ship, partialChassisData: Partial<BaseChassisData>) {
    if (!partialChassisData.chassisId) return

    const chassisToSwapTo = c.items.chassis[partialChassisData.chassisId]

    let foundChassisPassive = this.passives.find(
      (p) => p.data?.source?.chassisId,
    )
    while (foundChassisPassive) {
      this.removePassive(foundChassisPassive)
      foundChassisPassive = this.passives.find((p) => p.data?.source?.chassisId)
    }

    if (this.chassis && this.chassis.passives)
      this.chassis.passives.forEach((p) =>
        this.removePassive({
          ...p,
          data: {
            ...p.data,
            source: {
              chassisId: this.chassis.chassisId,
            },
          },
        }),
      )

    this.chassis = chassisToSwapTo

    if (chassisToSwapTo.passives)
      chassisToSwapTo.passives.forEach((p) =>
        this.applyPassive({
          ...p,
          data: {
            ...p.data,
            source: {
              chassisId: chassisToSwapTo.chassisId,
            },
          },
        }),
      )
    this.recalculateMass()

    if (this.human) {
      ;(this as HumanShip).resolveRooms()
      ;(this as HumanShip).checkAchievements(`chassis`)
    }
  }

  updateSlots() {
    let slots = this.chassis.slots
    const extraSlots = this.getPassiveIntensity(`extraEquipmentSlots`)
    slots += Math.round(extraSlots)
    this.slots = slots
    this.toUpdate.slots = slots
  }

  addItem(this: Ship, itemData: Partial<BaseItemData>): Item | false {
    let item: Item | undefined
    if (!itemData.itemType) {
      // * updating to use new itemId
      if (itemData.type) itemData.itemType = itemData.type as any
      if (itemData.id) itemData.itemId = itemData.id as any
      if (!itemData.itemType) return false
    }
    if (this.slots <= this.items.length) {
      c.log(`No chassis slots remaining to add item into.`)
      return false
    }
    if (itemData.itemType === `engine`) {
      const engineData = itemData as Partial<BaseEngineData>
      let foundItem: BaseEngineData | undefined
      if (engineData.itemId && engineData.itemId in c.items.engine)
        foundItem = c.items.engine[engineData.itemId]
      if (!foundItem) return false
      item = new Engine(foundItem, this, engineData)
    }
    if (itemData.itemType === `weapon`) {
      const weaponData = itemData as Partial<BaseWeaponData>
      let foundItem: BaseWeaponData | undefined
      if (weaponData.itemId && weaponData.itemId in c.items.weapon)
        foundItem = c.items.weapon[weaponData.itemId]
      if (!foundItem) return false
      item = new Weapon(foundItem, this, weaponData)
    }
    if (itemData.itemType === `scanner`) {
      const scannerData = itemData as Partial<BaseScannerData>
      let foundItem: BaseScannerData | undefined
      if (scannerData.itemId && scannerData.itemId in c.items.scanner)
        foundItem = c.items.scanner[scannerData.itemId]
      if (!foundItem) return false
      item = new Scanner(foundItem, this, scannerData)
    }
    if (itemData.itemType === `communicator`) {
      const communicatorData = itemData as Partial<BaseCommunicatorData>
      let foundItem: BaseCommunicatorData | undefined
      if (
        communicatorData.itemId &&
        communicatorData.itemId in c.items.communicator
      )
        foundItem = c.items.communicator[communicatorData.itemId]
      if (!foundItem) return false
      item = new Communicator(foundItem, this, communicatorData)
    }
    if (itemData.itemType === `armor`) {
      const armorData = itemData as Partial<BaseArmorData>
      let foundItem: BaseArmorData | undefined
      if (armorData.itemId && armorData.itemId in c.items.armor)
        foundItem = c.items.armor[armorData.itemId]
      if (!foundItem) return false
      item = new Armor(foundItem, this, armorData)
    }

    if (!item) {
      c.log(`Failed to find item for`, itemData)
      return false
    }

    this.items.push(item)

    if (item.passives)
      item.passives.forEach((p) =>
        this.applyPassive({
          ...p,
          data: {
            ...p.data,
            source: {
              item: {
                type: item!.itemType,
                id: item!.itemId,
              },
            },
          },
        }),
      )

    this.recalculateAll()
    this.recalculateMass()

    if (this.human) (this as HumanShip).checkAchievements(`items`)

    return item
  }

  removeItem(this: Ship, item: Item): boolean {
    const itemIndex = this.items.findIndex((i) => i === item)
    if (itemIndex === -1) return false
    this.items.splice(itemIndex, 1)

    if (item.passives) item.passives.forEach((p) => this.removePassive(p))

    this.recalculateAll()
    this.recalculateMass()
    return true
  }

  equipLoadout(this: Ship, id: LoadoutId): boolean {
    // c.log(`equipping loadout to`, this.name)
    const loadout = c.loadouts[id]
    if (!loadout) return false
    this.swapChassis({ chassisId: loadout.chassisId })
    loadout.items.forEach((baseData: Partial<BaseItemData>) =>
      this.addItem(baseData),
    )
    this.recalculateAll()
    return true
  }

  debugPoint(point: CoordinatePair, label?: string) {
    if (process.env.NODE_ENV !== `development`) return
    this.debugLocations.push({ point, label })
    this.toUpdate.debugLocations = this.debugLocations
  }

  // ----- radii -----
  recalculateAll() {
    this.recalculateMaxHp()
    this.updateSightAndScanRadius()
    this.updateMaxScanProperties()
    this.updateSlots()
  }

  recalculateMass() {
    let mass = this.chassis.mass
    for (let item of this.items) mass += item.mass
    this.crewMembers.forEach(
      (cm) =>
        (mass += cm.inventory.reduce(
          (total, cargo) => total + cargo.amount * 1000,
          0,
        )),
    )
    this.mass = c.r2(mass, 0)
    this.toUpdate.mass = this.mass
  }

  updateSightAndScanRadius() {
    if (this.tutorial) {
      this.radii.sight =
        this.tutorial.currentStep?.sightRange || c.baseSightRange
      this.radii.scan = this.tutorial.currentStep?.scanRange || 0
      this.toUpdate.radii = this.radii
      return
    }

    // ----- sight -----
    this.radii.sight = Math.max(
      c.baseSightRange,
      c.getRadiusDiminishingReturns(
        this.scanners.reduce((max, s) => s.sightRange * s.repair + max, 0),
        this.scanners.length,
      ),
    )
    const boostSight = this.getPassiveIntensity(`boostSightRange`) + 1
    this.radii.sight *= boostSight

    // ----- scan -----
    this.radii.scan = c.getRadiusDiminishingReturns(
      this.scanners.reduce((max, s) => s.shipScanRange * s.repair + max, 0),
      this.scanners.length,
    )
    const boostScan = this.getPassiveIntensity(`boostScanRange`) + 1
    this.radii.scan *= boostScan

    this.radii.gameSize = this.game?.gameSoftRadius || 1
    this.toUpdate.radii = this.radii
  }

  // ----- movement -----

  get canMove(): boolean {
    if (this.dead) return false
    return true
  }

  move(toLocation?: CoordinatePair) {
    if (!this.canMove) {
      this.hardStop()
      return
    }
    const previousLocation = [...this.location] as CoordinatePair
    if (toLocation) {
      this.location = [toLocation[0] || 0, toLocation[1] || 0]
      this.toUpdate.location = this.location
      this.game?.chunkManager.addOrUpdate(this, previousLocation)
    }
  }

  hardStop() {
    this.velocity = [0, 0]
    this.speed = 0
    this.toUpdate.velocity = this.velocity
    this.toUpdate.speed = this.speed
  }

  addPreviousLocation(
    this: Ship,
    previousLocation: CoordinatePair,
    currentLocation: CoordinatePair,
  ) {
    const newPLDistanceCutoff = 0.0003

    if (
      this.previousLocations.length > 1 &&
      previousLocation[0] ===
        this.previousLocations[this.previousLocations.length - 1]
          ?.location[0] &&
      previousLocation[1] ===
        this.previousLocations[this.previousLocations.length - 1]?.location[1]
    )
      return

    const distance = c.distance(
      this.location,
      this.previousLocations[this.previousLocations.length - 1]?.location,
    )

    const angle =
      distance > newPLDistanceCutoff
        ? Math.abs(
            c.angleFromAToB(
              this.previousLocations[this.previousLocations.length - 1]
                ?.location,
              previousLocation,
            ) - c.angleFromAToB(previousLocation, currentLocation),
          )
        : 0

    if (this.previousLocations.length < 1 || angle >= 5 || distance > 0.1) {
      // if (this.human)
      //   // c.log(this.previousLocations)
      //   c.log(
      //     `adding previous location to`,
      //     this.name,
      //     this.previousLocations.length,
      //     angle,
      //     distance,
      //   )
      this.previousLocations.push({
        time: Date.now(),
        location: [
          ...(currentLocation.map((l) => c.r2(l, 7)) as CoordinatePair),
        ],
      })
      while (
        this.previousLocations.length >
        (this.ai ? Ship.maxAIPreviousLocations : Ship.maxPreviousLocations)
      )
        this.previousLocations.shift()
      this.toUpdate.previousLocations = this.previousLocations
    }
  }

  isAt(
    this: Ship,
    coords: CoordinatePair,
    arrivalThresholdMultiplier: number = 1,
  ): boolean {
    return c.pointIsInsideCircle(
      coords,
      this.location,
      (this.game?.settings.arrivalThreshold ||
        c.defaultGameSettings.arrivalThreshold) * arrivalThresholdMultiplier,
    )
  }

  applyTickOfGravity(this: Ship): void {
    if (!this.human) return
    if (this.planet) return
    if (!this.canMove) return

    for (let planet of this.seenPlanets || []) {
      const distance = c.distance(planet.location, this.location)
      if (
        distance <=
          (this.game?.settings.gravityRadius ||
            c.defaultGameSettings.gravityRadius) &&
        distance >
          (this.game?.settings.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold)
      ) {
        const vectorToAdd = c
          .getGravityForceVectorOnThisBodyDueToThatBody(
            this,
            planet,
            this.game?.settings.gravityCurveSteepness ||
              c.defaultGameSettings.gravityCurveSteepness,
            this.game?.settings.gravityMultiplier ||
              c.defaultGameSettings.gravityMultiplier,
            this.game?.settings.gravityRadius ||
              c.defaultGameSettings.gravityRadius,
          )
          // comes back as kg * m / second == N
          .map(
            (g) =>
              // todo work out this *10 from the math, put into gravityForceMultiplier
              (g * 10) / this.mass / c.kmPerAu / c.mPerKm,
          )
        // c.log(
        //   this.name,
        //   planet.name,
        //   Math.abs(vectorToAdd[0]) +
        //     Math.abs(vectorToAdd[1]),
        // )
        if (
          Math.abs(vectorToAdd[0]) + Math.abs(vectorToAdd[1]) <
          0.0000000000001
        )
          return

        this.velocity[0] += vectorToAdd[0]
        this.velocity[1] += vectorToAdd[1]
        this.toUpdate.velocity = this.velocity
        this.speed = c.vectorToMagnitude(this.velocity)
        this.toUpdate.speed = this.speed
        this.direction = c.vectorToDegrees(this.velocity)
        this.toUpdate.direction = this.direction
      }
    }
  }

  // ----- crew -----

  membersIn(l: CrewLocation): CrewMember[] {
    return []
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillId) {
    return 1
  }

  // ----- combat -----

  canAttack(s: CombatShip): boolean {
    return false
  }

  get maxHp() {
    return this._maxHp
  }

  recalculateMaxHp() {
    this._maxHp = this.items.reduce((total, i) => i.maxHp + total, 0)
    if (this.hp > this._maxHp) this.hp = this._maxHp
  }

  get hp() {
    const prevHp = this._hp
    const total = this.items.reduce(
      (total, i) => Math.max(0, i.maxHp * i.repair) + total,
      0,
    )
    // if (this.human)
    //   c.log(
    //     `hp for ${this.name} is ${total} (${this.items.length} items)`,
    //   )
    this._hp = total
    const wasDead = this.dead
    this.dead = total <= 0
    if (this.dead !== wasDead) this.toUpdate.dead = this.dead

    if (
      `logEntry` in this &&
      this.human &&
      !this.dead &&
      prevHp > this._maxHp * Ship.notifyWhenHealthDropsToPercent &&
      this._hp <= this._maxHp * Ship.notifyWhenHealthDropsToPercent
    ) {
      this.logEntry(
        `HP has dropped below ${Ship.notifyWhenHealthDropsToPercent * 100}%!`,
        `notify`,
        `warning`,
      )
    }
    return total
  }

  set hp(newValue) {
    this._hp = newValue
    if (this._hp < 0) this._hp = 0
    if (this._hp > this._maxHp) this._hp = this._maxHp
    this.toUpdate._hp = this._hp
  }

  // ----- passives -----
  getPassiveIntensity(id: ShipPassiveEffectId): number {
    return this.passives
      .filter((p) => p.id === id)
      .reduce((total, p) => (p.intensity || 0) + total, 0)
  }

  // ----- stats -----
  addStat(statname: ShipStatKey, amount: number) {
    const existing = this.stats.find((s) => s.stat === statname)
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount = (existing.amount || 0) + amount
    this.toUpdate.stats = this.stats
  }

  setStat(statname: ShipStatKey, amount: number) {
    const existing = this.stats.find((s) => s.stat === statname)
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount = amount
    this.toUpdate.stats = this.stats
  }

  getStat(statname: ShipStatKey) {
    const existing = this.stats.find((s) => s.stat === statname)
    if (!existing) return 0
    return existing.amount
  }

  toAdminStub(): ShipStub {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      guildId: (this as any).guildId,
      human: this.human,
      ai: this.ai,
      previousLocations: this.previousLocations,
      attackable: this.attackable,
      dead: this.dead,
      rooms: (this as any).rooms,
      achievements: this.achievements,
      radii: this.radii,
      speed: this.speed,
      velocity: this.velocity,
      direction: this.direction,
      chassis: this.chassis,
      items: this.items.map((i: any) => ({
        itemId: i.itemId,
        itemType: i.itemType,
        displayName: i.displayName,
        cooldownRemaining: i.cooldownRemaining,
        chargeRequired: i.chargeRequired,
        repair: i.repair,
        maxHp: i.maxHp,
      })),
      crewMembers: (this as any).crewMembers?.map((cm) => ({
        id: cm.id,
        name: cm.name,
        speciesId: cm.speciesId,
      })),
      spawnPoint: (this as any).spawnPoint,
      level: (this as any).level,
      tagline: this.tagline || undefined,
      headerBackground: this.headerBackground || undefined,
      debugLocations: this.debugLocations,
      targetShip: (this as any).targetShip?.toReference() || null,
    }
  }

  toReference(): Reference {
    return {
      type: `ship`,
      name: this.name,
      id: this.id,
      guildId: this.guildId,
      tagline: this.tagline || undefined,
      headerBackground: this.headerBackground || undefined,
      level: (this as any).level,
    }
  }

  // ----- helpers -----

  adjustedTarget(target: CoordinatePair) {
    const angleToTarget = c.angleFromAToB(this.location, target)
    const angleMovingAwayFromTarget = c.angleDifference(
      this.direction,
      angleToTarget,
      true,
    )
    const percentMovingAwayFromTarget = angleMovingAwayFromTarget / 180

    const distance = c.distance(this.location, target)
    const speedOverDistance = this.speed / distance
    // * goes up with speed, proximity to target, and amount we're moving away. multiplier, goes from 1
    const urgency =
      1 +
      c.clamp(
        0,
        (Math.abs(percentMovingAwayFromTarget) * speedOverDistance) / 4e-5,
        5,
      )

    // const ticksAtCurrentSpeedToReachTarget =
    //   distance / c.vectorToMagnitude(this.velocity)
    // const howHardToTurnPercent = Math.min(
    //   Math.abs(percentMovingAwayFromTarget),
    //   1,
    // )
    // const percentBackwards = c.clamp(
    //   0,
    //   (Math.abs(percentMovingAwayFromTarget) - 0.5) * 2,
    //   1,
    // )

    const approxTicksToTurnToTargetAngle =
      Math.abs(percentMovingAwayFromTarget) * this.speed * 10e7 || 1

    // * multiplier that determines how many times more than the angle difference we should be
    const intensity = 6

    // * instead of permanently getting _closer_ to the desired angle, intentionally overshoot slightly to actually hit it
    const intentionalOvershootDegrees = 3

    // from "straight", how hard can the turn be? 0 - 179.5
    const maximumTurnDegrees =
      (90 +
        89.5 * Math.min(1, Math.abs(percentMovingAwayFromTarget) * urgency)) *
      c.clamp(0.01, approxTicksToTurnToTargetAngle / 5, 1)

    const howHardToTurnDegrees = c.clamp(
      maximumTurnDegrees * -1,

      angleMovingAwayFromTarget * intensity * urgency * -1 +
        intentionalOvershootDegrees *
          (percentMovingAwayFromTarget > 0 ? -1 : 1),

      maximumTurnDegrees,
    )

    // const approxTicksRequiredToReachTarget =
    //   ticksAtCurrentSpeedToReachTarget *
    //   (1 + Math.abs(percentMovingAwayFromTarget) * 5) // 1 = existing distance + time to stop and time to go back

    // const percentToAdjust = Math.min(
    //   Math.abs(percentMovingAwayFromTarget) *
    //     speedOverDistance,
    // )
    // const adjustedTarget = [
    //   target[0] - percentToAdjust * this.velocity[0],
    //   target[1] - percentToAdjust * this.velocity[1],
    // ] as CoordinatePair
    const angleToThrust =
      this.speed < 0.0000002
        ? angleToTarget
        : (howHardToTurnDegrees + this.direction + 360 * 2) % 360
    // if (this.human)
    //   c.log(this.speed, angleToTarget, angleToThrust)
    const turnUV = c.degreesToUnitVector(angleToThrust)
    const adjustedTarget = [
      this.location[0] + turnUV[0] * Math.max(0.001, this.speed * 1000),
      this.location[1] + turnUV[1] * Math.max(0.001, this.speed * 1000),
    ] as CoordinatePair

    // if (this.human)
    //   c.log({
    //     maximumTurnDegrees,
    //     // ticksAtCurrentSpeedToReachTarget,
    //     // speedOverDistance,
    //     urgency,
    //     approxTicksToTurnToTargetAngle,
    //     // percentMovingAwayFromTarget,
    //     // // // ticksAtCurrentSpeedToReachTarget,
    //     // // howHardToTurnPercent,
    //     howHardToTurnDegrees,
    //     // // percentBackwards,
    //     // currentDirection: this.direction,
    //     angleToTarget,
    //     angleToThrust,
    //     // // turnUV,
    //     // approxTicksRequiredToReachTarget,
    //   })

    if (this.human) this.debugPoint(adjustedTarget, `adjusted`)

    return adjustedTarget
  }

  // ----- misc stubs -----

  logEntry(s: LogContent, lv: LogLevel, icon?: LogIcon, isGood?: boolean) {}

  updateMaxScanProperties() {}

  applyPassive(p: ShipPassiveEffect) {}
  applyTimedPassive(p: ShipPassiveEffect & { until: number }) {}

  removePassive(p: ShipPassiveEffect) {}

  checkExpiredPassives() {}

  receiveBroadcast(
    message: string,
    from: Ship | Planet,
    garbleAmount: number,
    recipients: Ship[],
  ) {}
}
