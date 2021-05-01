import c from '../../../../common/dist'

import { Game } from '../Game'

export class Planet {
  readonly name: string
  readonly color: string
  readonly location: CoordinatePair
  readonly game: Game

  constructor(
    { name, color, location }: BasePlanetData,
    game: Game,
  ) {
    this.game = game
    this.name = name
    this.color = color
    this.location = location
  }

  identify() {
    c.log(
      `Planet: ${this.name} (${this.color}) at ${this.location}`,
    )
  }
}
