import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Planet } from './Planet'
import type { Ship } from './Ship/Ship'
import { Stubbable } from './Stubbable'

export class Faction extends Stubbable {
  readonly type = `faction`
  readonly name: string
  readonly id: FactionKey
  readonly color: string
  homeworld: Planet | null = null
  readonly ai: boolean
  readonly game: Game

  constructor(
    { name, id, ai, color }: BaseFactionData,
    game: Game,
  ) {
    super()
    this.name = name
    this.id = id
    this.ai = Boolean(ai)
    this.color = color
    this.game = game
  }

  get members(): Ship[] {
    return this.game.ships.filter(
      (s) => s.faction && s.faction.id === this.id,
    )
  }
}
