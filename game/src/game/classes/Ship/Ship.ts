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
  static maxPreviousLocations: number = 15

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
  attackable = false
  _hp = 10 // set in hp setter below
  _maxHp = 10
  dead = false // set in hp setter below
  obeysGravity = true
  mass = 1000000

  constructor(
    {
      name,
      species,
      chassis,
      items,
      loadout,
      seenPlanets,
      location,
      previousLocations,
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

    // if (this.dead) return
    // if (this.obeysGravity) this.applyTickOfGravity()
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
    return true
  }

  equipLoadout(this: Ship, name: LoadoutName): boolean {
    const loadout = loadouts[name]
    if (!loadout) return false
    loadout.items.forEach(
      (baseData: Partial<BaseItemData>) =>
        this.addItem(baseData),
    )
    return true
  }

  // ----- radii -----
  updateThingsThatCouldChangeOnItemChange() {
    this.recalculateMaxHp()
    this.updateSightAndScanRadius()
  }

  updateSightAndScanRadius() {
    if (this.tutorial) {
      this.radii.sight =
        this.tutorial.currentStep.sightRange
      this.radii.scan = 0 // this.tutorial.currentStep.sightRange
      this.toUpdate.radii = this.radii
      return
    }
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

  lastMoveAngle = 0

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
    locationBeforeThisTick: CoordinatePair,
  ) {
    const lastPrevLoc =
      this.previousLocations[
        this.previousLocations.length - 1
      ]
    const newAngle = c.angleFromAToB(
      this.location,
      locationBeforeThisTick,
    )
    if (
      !lastPrevLoc ||
      (Math.abs(newAngle - this.lastMoveAngle) > 8 &&
        c.distance(this.location, lastPrevLoc) > 0.001)
    ) {
      if (
        locationBeforeThisTick &&
        locationBeforeThisTick[0]
      )
        this.previousLocations.push(locationBeforeThisTick)
      while (
        this.previousLocations.length >
        Ship.maxPreviousLocations
      )
        this.previousLocations.shift()
      this.toUpdate.previousLocations =
        this.previousLocations
    }
    this.lastMoveAngle = newAngle
  }

  isAt(this: Ship, coords: CoordinatePair) {
    return c.pointIsInsideCircle(
      this.location,
      coords,
      c.ARRIVAL_THRESHOLD,
    )
  }

  applyTickOfGravity(this: Ship): void {
    if (!this.canMove) return

    if (this.human) {
      for (let planet of this.visible?.planets || []) {
        const distance = c.distance(
          planet.location,
          this.location,
        )
        if (
          distance <= c.GRAVITY_RANGE &&
          distance > c.ARRIVAL_THRESHOLD
        ) {
          const FAKE_MULTIPLIER_TO_GO_FROM_FORCE_OVER_TIME_TO_SINGLE_TICK = 10
          const vectorToAdd = c
            .getGravityForceVectorOnThisBodyDueToThatBody(
              this,
              planet,
            )
            .map(
              (g) =>
                ((g *
                  (c.deltaTime / 1000) *
                  c.gameSpeedMultiplier) /
                  this.mass /
                  c.KM_PER_AU /
                  c.M_PER_KM) *
                FAKE_MULTIPLIER_TO_GO_FROM_FORCE_OVER_TIME_TO_SINGLE_TICK,
            )
          // c.log(
          //   this.name,
          //   planet.name,
          //   math.abs(vectorToAdd[0] + vectorToAdd[1]),
          // )
          if (
            Math.abs(vectorToAdd[0] + vectorToAdd[1]) <
            0.000000001
          )
            return

          // if (c.distance(this.location, [this.location[0] + vectorToAdd[0],
          //   this.location[1] + vectorToAdd[1]]) > c.distance(this.location, planet.location)){
          //     this.location = planet.location
          //   }

          // c.log(vectorToAdd)
          this.location[0] += vectorToAdd[0]
          this.location[1] += vectorToAdd[1]
          this.toUpdate.location = this.location
        }
      }
    }

    // todo
    //
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
