import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Faction } from '../Faction'
import type { Planet } from '../Planet/Planet'
import type { Cache } from '../Cache'
import type { Zone } from '../Zone'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'

import { Engine } from '../Item/Engine'
import type { Item } from '../Item/Item'
import { Weapon } from '../Item/Weapon'
import { Scanner } from '../Item/Scanner'
import { Communicator } from '../Item/Communicator'
import { Armor } from '../Item/Armor'
import loadouts from '../../presets/loadouts'
import type { Species } from '../Species'
import { Stubbable } from '../Stubbable'
import type { Tutorial } from './addins/Tutorial'
import { AIShip } from './AIShip'

export class Ship extends Stubbable {
  static maxPreviousLocations: number = 30

  readonly type = `ship`
  name: string
  planet: Planet | false = false
  readonly faction: Faction
  readonly species: Species
  readonly game: Game
  readonly radii: { [key in RadiusType]: number } = {
    sight: 0,
    broadcast: 0,
    scan: 0,
    attack: 0,
    gameSize: 0,
  }

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
    attackRemnants: AttackRemnant[]
    trails?: CoordinatePair[][]
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
  availableTaglines: string[] = []
  headerBackground: string | null = null
  availableHeaderBackgrounds: string[] = [`Default`]
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
      species,
      chassis,
      items,
      loadout,
      seenPlanets,
      seenLandmarks,
      location,
      velocity,
      previousLocations,
      tagline,
      availableTaglines,
      headerBackground,
      availableHeaderBackgrounds,
      stats,
    }: BaseShipData,
    game: Game,
  ) {
    super()
    this.game = game
    this.name = name
    this.rename(name)

    this.ai = true
    this.human = false

    this.species = game.species.find(
      (s) => s.id === species.id,
    )!
    if (!this.species) {
      c.log(`red`, `no species found for`, species)
      this.species = game.species[0]
    }
    this.faction = this.species.faction

    this.velocity = velocity || [0, 0]
    if (location) {
      this.location = location
    } else if (this.faction) {
      this.location = [
        ...(this.faction.homeworld?.location || [0, 0]),
      ].map(
        (pos) =>
          pos +
          c.randomBetween(
            c.arrivalThreshold * -0.4,
            c.arrivalThreshold * 0.4,
          ),
      ) as CoordinatePair
      // c.log(`fact`, this.location, this.faction.homeworld)
    } else this.location = [0, 0]

    if (previousLocations)
      this.previousLocations = previousLocations

    if (tagline) this.tagline = tagline
    if (availableTaglines)
      this.availableTaglines = availableTaglines
    if (headerBackground)
      this.headerBackground = headerBackground
    if (availableHeaderBackgrounds?.length)
      this.availableHeaderBackgrounds =
        availableHeaderBackgrounds

    if (seenPlanets)
      this.seenPlanets = seenPlanets
        .map(({ name }: { name: string }) =>
          this.game.planets.find((p) => p.name === name),
        )
        .filter((p) => p) as Planet[]

    if (seenLandmarks)
      this.seenLandmarks = seenLandmarks
        .filter((l: any) => l?.type === `zone`)
        .map(({ id }: { id: string }) =>
          this.game.zones.find((z) => z.id === id),
        )
        .filter((z: Zone | undefined) => z) as Zone[]

    if (
      chassis &&
      chassis.id &&
      c.items.chassis[chassis.id]
    )
      this.chassis = c.items.chassis[chassis.id]
    else if (
      loadout &&
      c.items.chassis[loadouts[loadout]?.chassis]
    )
      this.chassis =
        c.items.chassis[loadouts[loadout].chassis]
    else this.chassis = c.items.chassis.starter1

    this.updateSlots()

    if (items) items.forEach((i) => this.addItem(i))
    if (!items && loadout) this.equipLoadout(loadout)
    this.hp = this.maxHp

    this.updateSightAndScanRadius()
    this.recalculateMaxHp()
    this._hp = this.hp

    if (stats) this.stats = [...stats]

    // passively lose previous locations over time
    // so someone who, for example, sits forever at a planet loses their trail eventually
    setInterval(() => {
      if (!this.previousLocations.length) return
      this.previousLocations.shift()
      if (this.human)
        c.log(`removing previous location from`, this.name)
    }, (c.tickInterval * 1000000) / c.gameSpeedMultiplier)
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

    if (this.name) {
      c.log(prevName, newName, this.name)
    }

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
    chassisData: Partial<BaseChassisData>,
  ) {
    if (!chassisData.id) return
    const chassisToSwapTo = c.items.chassis[chassisData.id]
    this.chassis = chassisToSwapTo
    this.recalculateMass()
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

    if (this.items.length === 5)
      this.addHeaderBackground(
        `Flat 1`,
        `equipping 5 items`,
      )
    else if (this.items.length === 8)
      this.addHeaderBackground(
        `Flat 2`,
        `equipping 8 items`,
      )

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
    c.log(`equipping loadout to`, this.name)
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
      (this.passives.find((p) => p.id === `boostSightRange`)
        ?.intensity || 0) + 1
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
      (this.passives.find((p) => p.id === `boostScanRange`)
        ?.intensity || 0) + 1
    this.radii.scan *= boostScan

    this.radii.gameSize = this.game.gameSoftRadius
    this.toUpdate.radii = this.radii
  }

  // ----- movement -----

  get canMove(): boolean {
    if (this.dead) return false
    return true
  }

  move(toLocation?: CoordinatePair) {
    if (toLocation) {
      this.location = [...toLocation]
      this.toUpdate.location = this.location
    }
  }

  addPreviousLocation(
    this: Ship,
    previousLocation: CoordinatePair,
    currentLocation: CoordinatePair,
  ) {
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

    if (
      this.previousLocations.length < 1 ||
      (Math.abs(
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
      ) > 5 &&
        c.distance(
          this.location,
          this.previousLocations[
            this.previousLocations.length - 1
          ],
        ) > 0.000005)
    ) {
      if (this.human)
        c.log(
          `adding previous location to`,
          this.name,
          this.previousLocations.length,
          Math.abs(
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
          ),
          c.distance(
            this.location,
            this.previousLocations[
              this.previousLocations.length - 1
            ],
          ),
        )
      this.previousLocations.push([...currentLocation])
      while (
        this.previousLocations.length >
        Ship.maxPreviousLocations
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
      this.location,
      coords,
      c.arrivalThreshold * arrivalThresholdMultiplier,
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
        distance <= c.gravityRange &&
        distance > c.arrivalThreshold
      ) {
        const vectorToAdd = c
          .getGravityForceVectorOnThisBodyDueToThatBody(
            this,
            planet,
          )
          // comes back as kg * m / second == N
          .map(
            (g) =>
              (g *
                Math.min(c.deltaTime / c.tickInterval, 2) *
                c.gameSpeedMultiplier) /
              this.mass /
              c.kmPerAu /
              c.mPerKm,
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
    const total = this.items.reduce(
      (total, i) => Math.max(0, i.maxHp * i.repair) + total,
      0,
    )
    this._hp = total
    const wasDead = this.dead
    this.dead = total <= 0
    if (this.dead !== wasDead)
      this.toUpdate.dead = this.dead
    return total
  }

  set hp(newValue) {
    this._hp = newValue
    if (this._hp < 0) this._hp = 0
    if (this._hp > this._maxHp) this._hp = this._maxHp
    this.toUpdate._hp = this._hp
  }

  // ----- cosmetics -----
  addTagline(tagline: string, reason: string) {
    if (this.availableTaglines.find((t) => t === tagline))
      return
    this.availableTaglines.push(tagline)
    this.toUpdate.availableTaglines = this.availableTaglines
    this.logEntry(
      [
        `Unlocked a new ship tagline for ${reason}:`,
        { text: `"${tagline}"`, color: `var(--success)` },
      ],
      `high`,
    )
  }

  addHeaderBackground(bg: string, reason: string) {
    if (
      this.availableHeaderBackgrounds.find((b) => b === bg)
    )
      return
    this.availableHeaderBackgrounds.push(bg)
    this.toUpdate.availableHeaderBackgrounds =
      this.availableHeaderBackgrounds
    this.logEntry(
      [
        `Unlocked a new ship header for ${reason}:`,
        { text: `"${bg}"`, color: `var(--success)` },
      ],
      `high`,
    )
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

  toLogStub() {
    return {
      type: `ship`,
      name: this.name,
      faction: {
        type: `faction`,
        id: this.faction.id,
      },
      species: {
        type: `species`,
        id: this.species.id,
      },
      tagline: this.tagline,
      headerBackground: this.headerBackground,
      level: (this as any).level,
    }
  }

  // ----- misc stubs -----

  logEntry(s: LogContent, lv: LogLevel) {}

  updateMaxScanProperties() {}

  applyPassive(p: ShipPassiveEffect) {}

  removePassive(p: ShipPassiveEffect) {}

  receiveBroadcast(
    message: string,
    from: Ship | Planet,
    garbleAmount: number,
    recipients: Ship[],
  ) {}
}
