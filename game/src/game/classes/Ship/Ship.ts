import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Faction } from '../Faction'
import type { Engine } from '../Item/Engine'
import type { Item } from '../Item/Item'
import type { Weapon } from '../Item/Weapon'
import type { Planet } from '../Planet'
import type { Cache } from '../Cache'
import type { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'

import {
  addWeapon,
  addEngine,
  removeItem,
  equipLoadout,
} from './addins/items'
import io from '../../../server/io'

export class Ship {
  static maxPreviousLocations: number = 50

  readonly name: string
  planet: Planet | false
  readonly faction: Faction | false
  readonly game: Game
  readonly radii: { [key in RadiusType]: number } = {
    sight: 0,
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
  readonly weapons: Weapon[] = []
  readonly engines: Engine[] = []
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

  constructor(
    {
      name,
      faction,
      weapons,
      engines,
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

    if (loadout) this.equipLoadout(loadout)
    if (weapons)
      weapons.forEach((w) => this.addWeapon(w.id, w))
    if (engines)
      engines.forEach((e) => this.addEngine(e.id, e))
    this.hp = this.maxHp

    this.updateSightRadius()
  }

  identify() {
    c.log(
      `Ship: ${this.name} (${this.id}) at ${this.location}`,
    )
    if (this.planet)
      c.log(`      docked at ${this.planet.name}`)
    else c.log(`      velocity: ${this.velocity}`)
  }

  tick() {
    if (this.dead) return

    this.visible = this.game.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
    )

    // ----- updates for frontend -----
    this.toUpdate.visible = c.stubify<any, VisibleStub>(
      this.visible,
      [`visible`, `seenPlanets`],
    )
    this.toUpdate.weapons = this.weapons.map((w) =>
      c.stubify<Weapon, WeaponStub>(w),
    )
    this.toUpdate.engines = this.engines.map((e) =>
      c.stubify<Engine, EngineStub>(e),
    )

    // ----- move -----
    this.move()
    if (this.obeysGravity) this.applyTickOfGravity()

    // ----- send update to listeners -----
    if (!Object.keys(this.toUpdate).length) return
    io.to(`ship:${this.id}`).emit(`ship:update`, {
      id: this.id,
      updates: this.toUpdate,
    })
    this.toUpdate = {}
  }

  // ----- item mgmt -----

  get items(): Item[] {
    const items = [...this.weapons, ...this.engines]
    return items
  }

  addWeapon = addWeapon
  addEngine = addEngine
  removeItem = removeItem
  equipLoadout = equipLoadout

  // ----- radii -----
  updateSightRadius() {
    this.radii.sight = 0.3
    this.toUpdate.radii = this.radii
  }

  // ----- movement -----

  lastMoveAngle = 0

  get canMove(): boolean {
    if (this.dead) return false
    return true
  }

  move(toLocation?: CoordinatePair) {
    const previousLocation: CoordinatePair = [
      ...this.location,
    ]

    if (toLocation) {
      this.location = toLocation
      this.speed = 0
      this.velocity = [0, 0]
      this.toUpdate.location = this.location
      this.toUpdate.speed = this.speed
      this.toUpdate.velocity = this.velocity
      this.addPreviousLocation(previousLocation)
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
    return (
      Math.abs(coords[0] - this.location[0]) <
        c.arrivalThreshold &&
      Math.abs(coords[1] - this.location[1]) <
        c.arrivalThreshold
    )
  }

  applyTickOfGravity(this: Ship): void {
    // if (!this.canMove) return
    // todo
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
