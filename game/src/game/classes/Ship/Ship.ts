import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Faction } from '../Faction'
import type { Planet } from '../Planet'
import type { Cache } from '../Cache'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'

import { Engine } from '../Item/Engine'
import type { Item } from '../Item/Item'
import { Weapon } from '../Item/Weapon'
import { Scanner } from '../Item/Scanner'
import { Communicator } from '../Item/Communicator'
import { Armor } from '../Item/Armor'
import loadouts from '../../presets/items/loadouts'
import {
  weapon as weaponPresets,
  engine as enginePresets,
  scanner as scannerPresets,
  communicator as communicatorPresets,
  armor as armorPresets,
  chassis as chassisPresets,
} from '../../presets/items'
import type { Species } from '../Species'
import { Stubbable } from '../Stubbable'
import type { Tutorial } from './addins/Tutorial'

export class Ship extends Stubbable {
  static maxPreviousLocations: number = 30

  name: string = `ship`
  planet: Planet | false = false
  readonly faction: Faction
  readonly species: Species
  readonly game: Game
  readonly radii: { [key in RadiusType]: number } = {
    sight: 0,
    broadcast: 0,
    scan: 0,
    attack: 0,
    game: 0,
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
  } = {
    ships: [],
    planets: [],
    caches: [],
    attackRemnants: [],
  }

  readonly seenPlanets: Planet[] = []
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
  attackable = false
  _hp = 10 // set in hp setter below
  _maxHp = 10
  dead = false // set in hp setter below
  obeysGravity = true
  mass = 10000

  constructor(
    {
      name,
      species,
      chassis,
      items,
      loadout,
      seenPlanets,
      location,
      velocity,
      previousLocations,
      tagline,
      availableTaglines,
      headerBackground,
      availableHeaderBackgrounds,
    }: BaseShipData,
    game: Game,
  ) {
    super()
    this.game = game
    this.rename(name)

    this.ai = true
    this.human = false

    this.species = game.species.find(
      (s) => s.id === species.id,
    )!
    this.faction = this.species.faction

    this.velocity = velocity || [0, 0]
    if (location) {
      this.location = location
    } else if (this.faction) {
      this.location = [
        ...(this.faction.homeworld?.location || [0, 0]),
      ]
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
        .map(({ name }: { name: PlanetName }) =>
          this.game.planets.find((p) => p.name === name),
        )
        .filter((p) => p) as Planet[]

    if (chassis && chassis.id && chassisPresets[chassis.id])
      this.chassis = chassisPresets[chassis.id]
    else if (
      loadout &&
      chassisPresets[loadouts[loadout]?.chassis]
    )
      this.chassis =
        chassisPresets[loadouts[loadout].chassis]
    else this.chassis = chassisPresets.starter1

    if (items) items.forEach((i) => this.addItem(i))
    if (!items && loadout) this.equipLoadout(loadout)
    this.hp = this.maxHp

    this.updateSightAndScanRadius()
    this.recalculateMaxHp()
    this._hp = this.hp
  }

  identify() {
    c.log(
      this.ai ? `gray` : `white`,
      `Ship: ${this.name} (${this.id}) at ${this.location}`,
    )
    if (this.planet)
      c.log(`      docked at ${this.planet.name}`)
    else c.log(`      velocity: ${this.velocity}`)
  }

  tick() {
    this._stub = null // invalidate stub

    if (this.dead) return
    if (this.obeysGravity) this.applyTickOfGravity()
    // c.log(`tick`, this.name)
  }

  rename(newName: string) {
    this.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0)
      this.name = `ship`
    this.toUpdate.name = this.name
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
    const chassisToSwapTo = chassisPresets[chassisData.id]
    this.chassis = chassisToSwapTo
    this.recalculateMass()
  }

  addItem(
    this: Ship,
    itemData: Partial<BaseItemData>,
  ): boolean {
    let item: Item | undefined
    if (!itemData.type) return false
    if (this.chassis.slots <= this.items.length) {
      c.log(`No chassis slots remaining to add item into.`)
      return false
    }
    if (itemData.type === `engine`) {
      const engineData = itemData as Partial<BaseEngineData>
      let foundItem: BaseEngineData | undefined
      if (engineData.id && engineData.id in enginePresets)
        foundItem = enginePresets[engineData.id]
      if (!foundItem) return false
      item = new Engine(foundItem, this, engineData)
    }
    if (itemData.type === `weapon`) {
      const weaponData = itemData as Partial<BaseWeaponData>
      let foundItem: BaseWeaponData | undefined
      if (weaponData.id && weaponData.id in weaponPresets)
        foundItem = weaponPresets[weaponData.id]
      if (!foundItem) return false
      item = new Weapon(foundItem, this, weaponData)
    }
    if (itemData.type === `scanner`) {
      const scannerData =
        itemData as Partial<BaseScannerData>
      let foundItem: BaseScannerData | undefined
      if (
        scannerData.id &&
        scannerData.id in scannerPresets
      )
        foundItem = scannerPresets[scannerData.id]
      if (!foundItem) return false
      item = new Scanner(foundItem, this, scannerData)
    }
    if (itemData.type === `communicator`) {
      const communicatorData =
        itemData as Partial<BaseCommunicatorData>
      let foundItem: BaseCommunicatorData | undefined
      if (
        communicatorData.id &&
        communicatorData.id in communicatorPresets
      )
        foundItem = communicatorPresets[communicatorData.id]
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
      if (armorData.id && armorData.id in armorPresets)
        foundItem = armorPresets[armorData.id]
      if (!foundItem) return false
      item = new Armor(foundItem, this, armorData)
    }

    if (item) {
      this.items.push(item)
      this.updateThingsThatCouldChangeOnItemChange()
      this.recalculateMass()
    }
    return true
  }

  removeItem(this: Ship, item: Item): boolean {
    const itemIndex = this.items.findIndex(
      (i) => i === item,
    )
    if (itemIndex === -1) return false
    this.items.splice(itemIndex, 1)
    this.updateThingsThatCouldChangeOnItemChange()
    this.recalculateMass()
    return true
  }

  equipLoadout(this: Ship, name: LoadoutName): boolean {
    const loadout = loadouts[name]
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
        this.tutorial.currentStep.sightRange
      this.radii.scan =
        this.tutorial.currentStep.scanRange || 0
      this.toUpdate.radii = this.radii
      return
    }
    this.radii.sight = Math.max(
      0.1,
      c.baseSightRange,
      c.getRadiusDiminishingReturns(
        this.scanners.reduce(
          (max, s) => s.sightRange * s.repair + max,
          0,
        ),
        this.scanners.length,
      ),
    )
    this.radii.scan = c.getRadiusDiminishingReturns(
      this.scanners.reduce(
        (max, s) => s.shipScanRange * s.repair + max,
        0,
      ),
      this.scanners.length,
    )
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
      ) > 8 &&
        c.distance(
          this.location,
          this.previousLocations[
            this.previousLocations.length - 1
          ],
        ) > 0.00001)
    ) {
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

  isAt(this: Ship, coords: CoordinatePair) {
    return c.pointIsInsideCircle(
      this.location,
      coords,
      c.ARRIVAL_THRESHOLD,
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
        distance <= c.GRAVITY_RANGE &&
        distance > c.ARRIVAL_THRESHOLD
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
                Math.min(c.deltaTime / c.TICK_INTERVAL, 2) *
                c.gameSpeedMultiplier) /
              this.mass /
              c.KM_PER_AU /
              c.M_PER_KM,
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

  cumulativeSkillIn(l: CrewLocation, s: SkillType) {
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

  // ----- misc stubs -----

  logEntry(s: string, lv: LogLevel) {}
  updateMaxScanProperties() {}
}
