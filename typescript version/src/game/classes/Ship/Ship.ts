import c from '../../../common'

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

  // ----- item mgmt -----

  addWeapon = addWeapon
  addEngine = addEngine
  removeItem = removeItem
  equipLoadout = equipLoadout

  get items() {
    const items = [
      ...this.weapons,
      ...this.engines,
    ] as Item[]
    return items
  }

  // ----- ranges -----

  get attackRange(): number {
    return this.weapons.reduce(
      (highest: number, curr: Weapon): number =>
        Math.max(curr.range, highest),
      0,
    )
  }

  // ----- movement -----

  move = move
  stop = stop
  thrust = thrust
  applyTickOfGravity = applyTickOfGravity
}
