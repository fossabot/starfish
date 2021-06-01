import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Faction } from './Faction'
import type { Planet } from './Planet'
import type { Ship } from './Ship/Ship'

export class Species {
  readonly id: SpeciesKey
  readonly icon: string
  readonly singular: string
  readonly game: Game
  faction: Faction

  constructor(
    { id, factionId, icon, singular }: BaseSpeciesData,
    game: Game,
  ) {
    this.id = id
    this.icon = icon
    this.singular = singular
    this.game = game
    this.faction = game.factions.find(
      (f) => f.id === factionId,
    )!
  }

  get members(): Ship[] {
    return this.game.ships.filter((s) => s.species === this)
  }
}
