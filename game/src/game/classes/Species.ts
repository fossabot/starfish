import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { Faction } from './Faction'
import type { Planet } from './Planet'
import type { Ship } from './Ship/Ship'
import { Stubbable } from './Stubbable'

export class Species {
  readonly type = `species`
  readonly id: SpeciesKey
  readonly icon: string
  readonly singular: string
  readonly game: Game
  readonly passives: ShipPassiveEffect[] = []
  readonly description: string
  faction: Faction

  constructor(
    {
      id,
      factionId,
      icon,
      singular,
      description,
      passives,
    }: BaseSpeciesData,
    game: Game,
  ) {
    this.id = id
    this.icon = icon
    this.singular = singular
    this.game = game
    this.faction = game.factions.find(
      (f) => f.id === factionId,
    )!
    this.description = description
    if (passives) this.passives = passives
  }

  get members(): Ship[] {
    return this.game.ships.filter((s) => s.species === this)
  }
}
