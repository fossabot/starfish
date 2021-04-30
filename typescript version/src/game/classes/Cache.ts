import c from '../../common'

import { Game } from '../Game'

export class Cache {
  readonly ownerId: string
  readonly contents: CacheContents[]
  readonly location: CoordinatePair
  readonly message: string = ``
  readonly game: Game

  constructor(
    { contents, location, ownerId, message }: BaseCacheData,
    game: Game,
  ) {
    this.game = game
    this.contents = contents
    this.ownerId = ownerId
    this.location = location
    if (message) this.message = message
  }
}
