import c from '../../../../../common/dist'

import { Game } from '../../Game'
import { Faction } from '../Faction'
import { Engine } from '../Item/Engine'
import { Item } from '../Item/Item'
import { Weapon } from '../Item/Weapon'

import {
  addWeapon,
  addEngine,
  removeItem,
  equipLoadout,
} from './addins/items'
import {
  move,
  stop,
  thrust,
  applyTickOfGravity,
} from './addins/movement'

export class Ship {
  readonly name: string
  planet: BasePlanetData | null
  readonly game: Game
  readonly faction: Faction | null

  readonly weapons: Weapon[] = []
  readonly engines: Engine[] = []
  readonly previousLocations: CoordinatePair[] = []
  id = `${Math.random()}`.substring(2) // re-set in subclasses
  location: CoordinatePair = [0, 0]
  velocity: CoordinatePair = [0, 0]
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
    if (this.planet !== null) this.move()
    if (this.obeysGravity) this.applyTickOfGravity()
  }

  //   export(): any {
  // const exportData = {...this}
  // delete exportData.game
  // exportData.planet = exportData.planet?.name
  //   }

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

  // ----- movement -----

  get canMove(): boolean {
    if (this.planet) return false
    if (this.dead) return false
    return true
  }

  move = move
  stop = stop
  thrust = thrust
  applyTickOfGravity = applyTickOfGravity

  // ----- combat -----

  canAttack(s: any): boolean {
    return false
  }
}
