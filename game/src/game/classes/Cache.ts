import c from '../../../../common/dist'

import type { Game } from '../Game'

export class Cache {
  static readonly expireTime = 1000 * 60 * 60 * 24 * 7 // one week

  readonly id: string
  readonly contents: CacheContents[]
  readonly location: CoordinatePair
  readonly message: string = ``
  readonly time: number = Date.now()
  readonly game: Game

  constructor(
    {
      contents,
      location,
      message,
      time,
      id,
    }: BaseCacheData,
    game: Game,
  ) {
    this.game = game
    this.contents = contents
    this.location = location
    if (message) this.message = message
    if (time) this.time = time
    this.id = id || `${Math.random()}`.substring(2)
  }
}
