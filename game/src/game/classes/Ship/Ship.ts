import { EventEmitter2 } from 'eventemitter2'
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
  // thrust,
  applyTickOfGravity,
} from './addins/motion'
import { io, stubify } from '../../../server/io'

export class Ship {
  static maxPreviousLocations: number = 10

  readonly name: string
  planet: Planet | null
  readonly faction: Faction | null
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
  readonly weapons: Weapon[] = []
  readonly engines: Engine[] = []
  readonly previousLocations: CoordinatePair[] = []
  id = `${Math.random()}`.substring(2) // re-set in subclasses
  location: CoordinatePair = [0, 0]
  velocity: CoordinatePair = [0, 0]
  targetLocation: CoordinatePair = [0, 0]
  human = false
  attackable = false
  dead = false
  hp = 10
  obeysGravity = true

  constructor(
    { name, planet, faction, loadout }: BaseShipData,
    game: Game,
  ) {
    this.game = game
    this.name = name
    this.planet =
      game.planets.find((p) => p.name === planet) || null
    if (this.planet)
      this.location = [...this.planet.location]
    this.faction =
      game.factions.find((f) => f.color === faction) || null

    if (loadout) this.equipLoadout(loadout)
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
      this.sightRange,
      this.id,
    )
    this.toUpdate.visible = stubify<any, VisibleStub>(
      this.visible,
    )

    if (!this.planet) this.move()
    if (this.obeysGravity) this.applyTickOfGravity()

    // ----- send update to listeners -----
    if (!Object.keys(this.toUpdate).length) return
    io.to(`ship:${this.id}`).emit('ship:update', {
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

  // ----- ranges -----

  get sightRange() {
    return 2
  }

  // ----- movement -----

  lastMoveAngle = 0

  get canMove(): boolean {
    if (!!this.planet) return false
    if (!!this.dead) return false
    return true
  }

  get atTargetLocation(): boolean {
    return (
      Math.abs(this.location[0] - this.targetLocation[0]) <
        0.000001 &&
      Math.abs(this.location[1] - this.targetLocation[1]) <
        0.000001
    )
  }

  move = move
  stop = stop
  // thrust = thrust
  applyTickOfGravity = applyTickOfGravity

  // ----- crew -----

  membersIn(l: CrewLocation): CrewMember[] {
    return []
  }

  // ----- combat -----

  canAttack(s: CombatShip): boolean {
    return false
  }

  get alive(): boolean {
    return true
  }
}
