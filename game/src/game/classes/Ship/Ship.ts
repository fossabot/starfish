import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Faction } from '../Faction'
import { Engine } from '../Item/Engine'
import type { Item } from '../Item/Item'
import { Weapon } from '../Item/Weapon'
import type { Planet } from '../Planet'
import type { Cache } from '../Cache'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'

import loadouts from '../../presets/loadouts'
import { weapons, engines } from '../../presets/items'

export class Ship {
  static maxPreviousLocations: number = 20

  readonly name: string
  planet: Planet | false
  readonly faction: Faction | false
  readonly game: Game
  readonly radii: { [key in RadiusType]: number } = {
    sight: 0,
    broadcast: 0,
    scan: 0,
    attack: 0,
  }

  ai: boolean
  human: boolean
  readonly crewMembers: CrewMember[] = []

  toUpdate: Partial<ShipStub> = {}
  visible: {
    ships: Ship[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
  } = {
    ships: [],
    planets: [],
    caches: [],
    attackRemnants: [],
  }

  readonly seenPlanets: Planet[] = []
  readonly items: Item[] = []
  readonly previousLocations: CoordinatePair[] = []
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
      faction,
      items,
      loadout,
      seenPlanets,
      location,
      previousLocations,
    }: BaseShipData,
    game: Game,
  ) {
    this.game = game
    this.name = name

    this.ai = true
    this.human = false

    this.faction =
      game.factions.find(
        (f) => f.color === faction?.color,
      ) || false

    if (location) this.location = location
    else if (this.faction) {
      this.location = [
        ...(this.faction.homeworld?.location || [0, 0]),
      ]
    } else this.location = [0, 0]

    this.planet =
      this.game.planets.find((p) =>
        this.isAt(p.location),
      ) || false

    if (previousLocations)
      this.previousLocations = previousLocations

    if (seenPlanets)
      this.seenPlanets = seenPlanets
        .map(({ name }: { name: PlanetName }) =>
          this.game.planets.find((p) => p.name === name),
        )
        .filter((p) => p) as Planet[]

    if (items) items.forEach((i) => this.addItem(i))
    if (!items && loadout) this.equipLoadout(loadout)
    this.hp = this.maxHp

    this.updateSightRadius()
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
    if (this.dead) return
    if (this.obeysGravity) this.applyTickOfGravity()
    // c.log(`tick`, this.name)
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

  addItem(
    this: Ship,
    itemData: Partial<BaseItemData>,
  ): boolean {
    let item: Item | undefined
    if (itemData.type === `engine`) {
      const engineData = itemData as Partial<BaseEngineData>
      let foundItem: BaseEngineData | undefined
      if (engineData.id && engineData.id in engines)
        foundItem = engines[engineData.id]
      if (!foundItem) return false
      item = new Engine(foundItem, this, engineData)
    }
    if (itemData.type === `weapon`) {
      const weaponData = itemData as Partial<BaseWeaponData>
      let foundItem: BaseWeaponData | undefined
      if (weaponData.id && weaponData.id in weapons)
        foundItem = weapons[weaponData.id]
      if (!foundItem) return false
      item = new Weapon(foundItem, this, weaponData)
    }

    if (item) {
      this.items.push(item)
      this.recalculateMaxHp()
      this.toUpdate.attackRadius = this.radii.attack
    }
    return true
  }

  removeItem(this: Ship, item: Item): boolean {
    const weaponIndex = this.items.findIndex(
      (w) => w === item,
    )
    if (weaponIndex !== -1) {
      this.items.splice(weaponIndex, 1)
      return true
    }
    const engineIndex = this.items.findIndex(
      (e) => e === item,
    )
    if (engineIndex !== -1) {
      this.items.splice(engineIndex, 1)
      return true
    }
    this.recalculateMaxHp()
    return false
  }

  equipLoadout(this: Ship, name: LoadoutName): boolean {
    const loadout = loadouts[name]
    if (!loadout) return false
    loadout.forEach((baseData: Partial<BaseItemData>) =>
      this.addItem(baseData),
    )
    return true
  }

  // ----- radii -----
  updateSightRadius() {
    this.radii.sight = 0.6
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
      this.location = toLocation
      this.toUpdate.location = this.location
      // this.speed = 0
      // this.velocity = [0, 0]
      // this.toUpdate.speed = this.speed
      // this.toUpdate.velocity = this.velocity
      // this.addPreviousLocation(previousLocation)
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
      for (let planet of this.visible.planets) {
        const distance = c.distance(
          planet.location,
          this.location,
        )
        if (
          distance <= c.GRAVITY_RANGE &&
          distance > c.ARRIVAL_THRESHOLD
        ) {
          const FAKE_MULTIPLIER_TO_GO_FROM_FORCE_OVER_TIME_TO_SINGLE_TICK = 100
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

  cumulativeSkillIn(l: CrewLocation, s: SkillName) {
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
  }

  get hp() {
    const total = this.items.reduce(
      (total, i) => i.maxHp * i.repair + total,
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
}
