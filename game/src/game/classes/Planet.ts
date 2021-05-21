import c from '../../../../common/dist'

import type { Game } from '../Game'

export class Planet {
  readonly name: string
  readonly color: string
  readonly location: CoordinatePair
  readonly game: Game
  readonly vendor: Vendor | null

  constructor(
    { name, color, location, vendor }: BasePlanetData,
    game: Game,
  ) {
    this.game = game
    this.name = name
    this.color = color
    this.location = location
    this.vendor = vendor || null
  }

  identify() {
    c.log(
      `Planet: ${this.name} (${this.color}) at ${this.location}`,
    )
  }
}
