import c from '../../../../common/dist'

import { Game } from '../Game'
import { Planet } from './Planet'
import { Ship } from './Ship/Ship'

export class Faction {
  readonly name: string
  readonly color: string
  readonly homeworld: Planet | null
  readonly ai: boolean
  readonly game: Game

  constructor(
    { name, color, homeworld, ai }: BaseFactionData,
    game: Game,
  ) {
    this.name = name
    this.color = color
    this.homeworld =
      game.planets.find((p) => p.name === homeworld) || null
    this.ai = Boolean(ai)
    this.game = game
  }

  get members(): Ship[] {
    return this.game.ships.filter(
      (s) => s.faction?.color === this.color,
    )
  }
}
