import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Faction } from './Faction'

export class Planet {
  readonly name: string
  readonly color: string
  readonly location: CoordinatePair
  readonly game: Game
  readonly vendor: Vendor | null
  readonly faction: Faction | null
  readonly races: string[]
  readonly repairCostMultiplier: number
  readonly radius: number
  mass = 5.974e30

  constructor(
    {
      name,
      color,
      location,
      vendor,
      faction,
      races,
      repairCostMultiplier,
      radius,
    }: BasePlanetData,
    game: Game,
  ) {
    this.game = game
    this.name = name
    this.color = color
    this.location = location
    this.radius = radius
    this.vendor = vendor || null
    this.faction =
      (faction
        ? this.game.factions.find(
            (f) => f.color === faction.color,
          )
        : null) || null
    this.races = races || []
    this.repairCostMultiplier = repairCostMultiplier || 0
  }

  identify() {
    c.log(
      `Planet: ${this.name} (${this.color}) at ${this.location}`,
    )
  }

  shipsAt() {
    return this.game.humanShips.filter(
      (s) => s.planet === this,
    )
  }
}
