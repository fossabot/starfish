import c from '../../../../../common/dist'

import { Game } from '../../Game'
import { Faction } from '../Faction'
import { Engine } from '../Item/Engine'
import { Item } from '../Item/Item'
import { Weapon } from '../Item/Weapon'
import { Planet } from '../Planet'
import { Cache } from '../Cache'
import { AttackRemnant } from '../AttackRemnant'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { CombatShip } from './CombatShip'

import {
  addWeapon,
  addEngine,
  removeItem,
  equipLoadout,
} from './addins/items'
import {
  move,
  stop,
  isAt,
  // thrust,
  applyTickOfGravity,
} from './addins/motion'
import { io, stubify } from '../../../server/io'
import { HumanShip } from './HumanShip'

export class Ship {
  static maxPreviousLocations: number = 10

  readonly name: string
  planet: Planet | false
  readonly faction: Faction | false
  readonly game: Game

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
  human = false
  attackable = false
  _hp = 10 // set in hp setter below
  _maxHp = 10
  dead = false // set in hp setter below
  obeysGravity = true

  constructor(
    {
      name,
      faction,
      loadout,
      seenPlanets,
      location,
    }: BaseShipData,
    game: Game,
  ) {
    this.game = game
    this.name = name

    this.faction =
      game.factions.find((f) => f.color === faction) ||
      false

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

    if (seenPlanets)
      this.seenPlanets = seenPlanets
        .map((name) =>
          this.game.planets.find((p) => p.name === name),
        )
        .filter((p) => p) as Planet[]

    if (loadout) this.equipLoadout(loadout)
    this.hp = this.maxHp
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
    this.visible = this.game.scanCircle(
      this.location,
      this.sightRadius,
      this.id,
    )
    const newPlanets = this.visible.planets.filter(
      (p) => !this.seenPlanets.includes(p),
    )
    if (newPlanets.length) {
      this.seenPlanets.push(...newPlanets)
      // todo alert ship
    }

    // ----- updates for frontend -----
    this.toUpdate.visible = stubify<any, VisibleStub>(
      this.visible,
      [`visible`, `seenPlanets`],
    )
    this.toUpdate.weapons = this.weapons.map((w) =>
      stubify<Weapon, WeaponStub>(w),
    )
    this.toUpdate.engines = this.engines.map((e) =>
      stubify<Engine, EngineStub>(e),
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

  sightRadius = 1

  // ----- movement -----

  lastMoveAngle = 0

  get canMove(): boolean {
    if (this.dead) return false
    return true
  }

  // get atTargetLocation(): boolean {
  //   return (
  //     math.abs(this.location[0] - this.targetLocation[0]) <
  //       0.000001 &&
  //     math.abs(this.location[1] - this.targetLocation[1]) <
  //       0.000001
  //   )
  // }

  move = move
  stop = stop
  isAt = isAt
  // thrust = thrust
  applyTickOfGravity = applyTickOfGravity

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
    return this.items.reduce(
      (total, i) => i.maxHp * i.repair + total,
      0,
    )
  }

  set hp(newValue) {
    this._hp = newValue
    if (this._hp < 0) this._hp = 0
    if (this._hp > this._maxHp) this._hp = this._maxHp
    this.toUpdate._hp = this._hp
  }
}
