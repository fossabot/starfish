import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Planet } from '../Planet/Planet'
import type { Cache } from '../Cache'
import type { Zone } from '../Zone'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'
import type { HumanShip } from './HumanShip/HumanShip'

import type { Item } from '../Item/Item'
import { Engine } from '../Item/Engine'
import { Weapon } from '../Item/Weapon'
import { Scanner } from '../Item/Scanner'
import { Communicator } from '../Item/Communicator'
import { Armor } from '../Item/Armor'

import loadouts from '../../presets/loadouts'

import { Stubbable } from '../Stubbable'
import type { Tutorial } from './HumanShip/Tutorial'

export class Ship extends Stubbable {
  static maxPreviousLocations: number = 70
  static maxAIPreviousLocations: number = 25
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
    trails?: { color?: string; points: CoordinatePair[] }[]
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
  previousLocations: CoordinatePair[] = []
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
  slots: number = 1
  attackable = false
  _hp = 10 // set in hp setter below
  _maxHp = 10
  dead = false // set in hp setter below
  obeysGravity = true
  mass = 10000
  stats: ShipStatEntry[] = []

  constructor(
    {
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
    }: BaseShipData = {} as any,
    game?: Game,
  ) {
    super()
    if (game) this.game = game
    this.name = name
    this.rename(name)

    this.ai = true
    this.human = false

    this.spawnedAt = spawnedAt || Date.now()

    this.velocity = velocity || [0, 0]
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
        ...(this.game?.getHomeworld(guildId)?.location || [
          0, 0,
        ]),
      ].map(
        (pos) =>
          pos +
          c.randomBetween(
            (this.game?.settings.arrivalThreshold ||
              c.defaultGameSettings.arrivalThreshold) *
              -0.4,
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
              (p) => !p.homeworld && p.pacifist,
            ) || [],
          )
          ?.location.map(
            (pos) =>
              pos +
              c.randomBetween(
                (this.game?.settings.arrivalThreshold ||
                  c.defaultGameSettings.arrivalThreshold) *
                  -0.4,
                (this.game?.settings.arrivalThreshold ||
                  c.defaultGameSettings.arrivalThreshold) *
                  0.4,
              ),
          ) as CoordinatePair) || [0, 0]),
      ]

    if (previousLocations)
      this.previousLocations = [...previousLocations]

    if (tagline) this.tagline = tagline
    if (headerBackground)
      this.headerBackground = headerBackground

    if (seenPlanets)
      this.seenPlanets = seenPlanets
        .map(
          ({ id, name }: { id: string; name?: string }) =>
            this.game?.planets.find(
              (p) =>
                p.id === id || (p.name && p.name === name),
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
    if (
      chassis &&
      chassis.id &&
      c.items.chassis[chassis.id]
    )
      this.swapChassis(c.items.chassis[chassis.id])
    else if (
      loadout &&
      c.items.chassis[loadouts[loadout]?.chassis]
    )
      this.swapChassis(
        c.items.chassis[loadouts[loadout].chassis],
      )
    else this.swapChassis(c.items.chassis.starter1)

    this.updateSlots()

    if (items) items.forEach((i) => this.addItem(i))
    if (!items && loadout) this.equipLoadout(loadout)

    this.updateSightAndScanRadius()
    this.recalculateMaxHp()
    this._hp = this.hp

    if (stats) this.stats = [...stats]

    if (guildId && c.guilds[guildId])
      this.changeGuild(guildId)

    // passively lose previous locations over time
    // so someone who, for example, sits forever at a planet loses their trail eventually
    setInterval(() => {
      if (!this.previousLocations.length) return
      this.previousLocations.shift()
      if (this.human)
        c.log(`removing previous location from`, this.name)
    }, c.tickInterval * 100000)
  }

  tick() {
    this._stub = null // invalidate stub

    if (this.dead) return
    if (this.obeysGravity) this.applyTickOfGravity()
    // c.log(`tick`, this.name)
  }

  rename(newName: string) {
    const prevName = this.name
    this.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0)
      this.name = `ship`

    if (this.name === prevName) return

    // if (this.name)
    //   c.log(`renaming ship:`, prevName, newName, this.name)

    this.toUpdate.name = this.name
    this.logEntry(
      [
        `The ship has been renamed to`,
        { color: `var(--success)`, text: this.name },
        `&nospace!`,
      ],
      `high`,
    )
  }

  changeGuild(this: Ship, id: GuildId) {
    // if somehow there already was one, remove its passives
    if (this.guildId) {
      for (let p of c.guilds[this.id].passives)
        this.removePassive(p)
    }

    if (c.guilds[id]) {
      this.guildId = id
      this.toUpdate.guildId = id
      for (let p of c.guilds[id].passives)
        this.applyPassive(p)

      if (this.human)
        (this as HumanShip).checkAchievements(`guild`)

      this.logEntry(
        [
          `${this.name} has joined the`,
          {
            color: c.guilds[id].color,
            text: c.guilds[id].name + ` Guild`,
          },
          `&nospace!`,
        ],
        `critical`,
      )

      if (this.planet)
        this.planet.shipsAt
          .filter((s) => s.guildId === this.guildId)
          .forEach((s) => {
            if (s === (this as any) || !s.planet) return
            s.logEntry([
              {
                text: this.name,
                color:
                  this.guildId &&
                  c.guilds[this.guildId].color,
                tooltipData: this.toReference() as any,
              },
              `has joined the`,
              {
                color: c.guilds[id].color,
                text: c.guilds[id].name + ` Guild`,
              },
              `&nospace!`,
            ])
          })
    }
  }

  // ----- item mgmt -----

  get engines(): Engine[] {
    return this.items.filter(
      (i) => i instanceof Engine,
    ) as Engine[]
  }

  get weapons(): Weapon[] {
    return this.items.filter(
      (i) => i instanceof Weapon,
    ) as Weapon[]
  }

  get scanners(): Scanner[] {
    return this.items.filter(
      (i) => i instanceof Scanner,
    ) as Scanner[]
  }

  get communicators(): Communicator[] {
    return this.items.filter(
      (i) => i instanceof Communicator,
    ) as Communicator[]
  }

  get armor(): Armor[] {
    return this.items.filter(
      (i) => i instanceof Armor,
    ) as Armor[]
  }

  swapChassis(
    this: Ship,
    partialChassisData: Partial<BaseChassisData>,
  ) {
    if (!partialChassisData.id) return

    const chassisToSwapTo =
      c.items.chassis[partialChassisData.id]

    if (this.chassis && this.chassis.passives)
      this.chassis.passives.forEach((p) =>
        this.removePassive({
          ...p,
          data: {
            ...p.data,
            source: {
              chassisId: this.chassis.id,
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
              chassisId: chassisToSwapTo.id,
            },
          },
        }),
      )
    this.recalculateMass()

    if (this.human)
      (this as HumanShip).checkAchievements(`chassis`)
  }

  updateSlots() {
    let slots = this.chassis.slots
    const extraSlots = this.getPassiveIntensity(
      `extraEquipmentSlots`,
    )
    slots += Math.round(extraSlots)
    this.slots = slots
    this.toUpdate.slots = slots
  }

  addItem(
    this: Ship,
    itemData: Partial<BaseItemData>,
  ): Item | false {
    let item: Item | undefined
    if (!itemData.type) return false
    if (this.slots <= this.items.length) {
      c.log(`No chassis slots remaining to add item into.`)
      return false
    }
    if (itemData.type === `engine`) {
      const engineData = itemData as Partial<BaseEngineData>
      let foundItem: BaseEngineData | undefined
      if (engineData.id && engineData.id in c.items.engine)
        foundItem = c.items.engine[engineData.id]
      if (!foundItem) return false
      item = new Engine(foundItem, this, engineData)
    }
    if (itemData.type === `weapon`) {
      const weaponData = itemData as Partial<BaseWeaponData>
      let foundItem: BaseWeaponData | undefined
      if (weaponData.id && weaponData.id in c.items.weapon)
        foundItem = c.items.weapon[weaponData.id]
      if (!foundItem) return false
      item = new Weapon(foundItem, this, weaponData)
    }
    if (itemData.type === `scanner`) {
      const scannerData =
        itemData as Partial<BaseScannerData>
      let foundItem: BaseScannerData | undefined
      if (
        scannerData.id &&
        scannerData.id in c.items.scanner
      )
        foundItem = c.items.scanner[scannerData.id]
      if (!foundItem) return false
      item = new Scanner(foundItem, this, scannerData)
    }
    if (itemData.type === `communicator`) {
      const communicatorData =
        itemData as Partial<BaseCommunicatorData>
      let foundItem: BaseCommunicatorData | undefined
      if (
        communicatorData.id &&
        communicatorData.id in c.items.communicator
      )
        foundItem =
          c.items.communicator[communicatorData.id]
      if (!foundItem) return false
      item = new Communicator(
        foundItem,
        this,
        communicatorData,
      )
    }
    if (itemData.type === `armor`) {
      const armorData = itemData as Partial<BaseArmorData>
      let foundItem: BaseArmorData | undefined
      if (armorData.id && armorData.id in c.items.armor)
        foundItem = c.items.armor[armorData.id]
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
                type: item!.type,
                id: item!.id,
              },
            },
          },
        }),
      )

    this.updateThingsThatCouldChangeOnItemChange()
    this.recalculateMass()

    if (this.human)
      (this as HumanShip).checkAchievements(`items`)

    return item
  }

  removeItem(this: Ship, item: Item): boolean {
    const itemIndex = this.items.findIndex(
      (i) => i === item,
    )
    if (itemIndex === -1) return false
    this.items.splice(itemIndex, 1)

    if (item.passives)
      item.passives.forEach((p) => this.removePassive(p))

    this.updateThingsThatCouldChangeOnItemChange()
    this.recalculateMass()
    return true
  }

  equipLoadout(this: Ship, id: LoadoutId): boolean {
    // c.log(`equipping loadout to`, this.name)
    const loadout = loadouts[id]
    if (!loadout) return false
    this.swapChassis({ id: loadout.chassis })
    loadout.items.forEach(
      (baseData: Partial<BaseItemData>) =>
        this.addItem(baseData),
    )
    this.updateThingsThatCouldChangeOnItemChange()
    return true
  }

  // ----- radii -----
  updateThingsThatCouldChangeOnItemChange() {
    this.recalculateMaxHp()
    this.updateSightAndScanRadius()
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
        this.tutorial.currentStep?.sightRange ||
        c.baseSightRange
      this.radii.scan =
        this.tutorial.currentStep?.scanRange || 0
      this.toUpdate.radii = this.radii
      return
    }

    // ----- sight -----
    this.radii.sight = Math.max(
      c.baseSightRange,
      c.getRadiusDiminishingReturns(
        this.scanners.reduce(
          (max, s) => s.sightRange * s.repair + max,
          0,
        ),
        this.scanners.length,
      ),
    )
    const boostSight =
      this.getPassiveIntensity(`boostSightRange`) + 1
    this.radii.sight *= boostSight

    // ----- scan -----
    this.radii.scan = c.getRadiusDiminishingReturns(
      this.scanners.reduce(
        (max, s) => s.shipScanRange * s.repair + max,
        0,
      ),
      this.scanners.length,
    )
    const boostScan =
      this.getPassiveIntensity(`boostScanRange`) + 1
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
    const previousLocation = [
      ...this.location,
    ] as CoordinatePair
    if (toLocation) {
      this.location = [...toLocation]
      this.toUpdate.location = this.location
      this.game?.chunkManager.addOrUpdate(
        this,
        previousLocation,
      )
    }
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
        this.previousLocations[
          this.previousLocations.length - 1
        ]?.[0] &&
      previousLocation[1] ===
        this.previousLocations[
          this.previousLocations.length - 1
        ]?.[1]
    )
      return

    // if (this.ai)
    //   c.log(
    //     this.name,
    //     c.angleFromAToB(
    //       this.previousLocations[
    //         this.previousLocations.length - 1
    //       ],
    //       previousLocation,
    //     ) -
    //       c.angleFromAToB(
    //         previousLocation,
    //         currentLocation,
    //       ),
    //   )

    const distance = c.distance(
      this.location,
      this.previousLocations[
        this.previousLocations.length - 1
      ],
    )

    const angle =
      distance > newPLDistanceCutoff
        ? Math.abs(
            c.angleFromAToB(
              this.previousLocations[
                this.previousLocations.length - 1
              ],
              previousLocation,
            ) -
              c.angleFromAToB(
                previousLocation,
                currentLocation,
              ),
          )
        : 0

    if (
      this.previousLocations.length < 1 ||
      angle >= 5 ||
      distance > 0.1
    ) {
      // if (this.human)
      //   // c.log(this.previousLocations)
      //   c.log(
      //     `adding previous location to`,
      //     this.name,
      //     this.previousLocations.length,
      //     angle,
      //     distance,
      //   )
      this.previousLocations.push([
        ...(currentLocation.map((l) =>
          c.r2(l, 7),
        ) as CoordinatePair),
      ])
      while (
        this.previousLocations.length >
        (this.ai
          ? Ship.maxAIPreviousLocations
          : Ship.maxPreviousLocations)
      )
        this.previousLocations.shift()
      this.toUpdate.previousLocations =
        this.previousLocations
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
        c.defaultGameSettings.arrivalThreshold) *
        arrivalThresholdMultiplier,
    )
  }

  applyTickOfGravity(this: Ship): void {
    if (!this.human) return
    if (this.planet) return
    if (!this.canMove) return

    for (let planet of this.seenPlanets || []) {
      const distance = c.distance(
        planet.location,
        this.location,
      )
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
          Math.abs(vectorToAdd[0]) +
            Math.abs(vectorToAdd[1]) <
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
    this._maxHp = this.items.reduce(
      (total, i) => i.maxHp + total,
      0,
    )
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
    if (this.dead !== wasDead)
      this.toUpdate.dead = this.dead

    if (
      `logEntry` in this &&
      this.human &&
      !this.dead &&
      prevHp >
        this._maxHp * Ship.notifyWhenHealthDropsToPercent &&
      this._hp <=
        this._maxHp * Ship.notifyWhenHealthDropsToPercent
    ) {
      this.logEntry(
        `${this.name}'s HP has dropped below ${
          Ship.notifyWhenHealthDropsToPercent * 100
        }%!`,
        `critical`,
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
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount += amount
    this.toUpdate.stats = this.stats
  }

  setStat(statname: ShipStatKey, amount: number) {
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount = amount
    this.toUpdate.stats = this.stats
  }

  getStat(statname: ShipStatKey) {
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
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
      items: this.items.map((i) => ({
        id: i.id,
        type: i.type,
        displayName: i.displayName,
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

  // ----- misc stubs -----

  logEntry(s: LogContent, lv: LogLevel) {}

  updateMaxScanProperties() {}

  applyPassive(p: ShipPassiveEffect) {}

  removePassive(p: ShipPassiveEffect) {}

  takeActionOnVisibleChange(
    previousVisible,
    currentVisible,
  ) {}

  receiveBroadcast(
    message: string,
    from: Ship | Planet,
    garbleAmount: number,
    recipients: Ship[],
  ) {}
}
