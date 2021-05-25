import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { HumanShip } from './Ship/HumanShip'

export class Cache {
  static readonly rePickUpTime = 1000 * 60 // 1 minute
  static readonly expireTime = 1000 * 60 * 60 * 24 * 7 // one week

  readonly id: string
  readonly contents: CacheContents[]
  readonly location: CoordinatePair
  readonly message: string = ``
  readonly time: number = Date.now()
  readonly game: Game
  readonly droppedBy: string | undefined

  constructor(
    {
      contents,
      location,
      message,
      time,
      id,
      droppedBy,
    }: BaseCacheData,
    game: Game,
  ) {
    this.game = game
    this.contents = contents
    this.location = location
    if (message) this.message = message
    if (time) this.time = time
    this.id = id || `${Math.random()}`.substring(2)
    this.droppedBy = droppedBy
  }

  canBePickedUpBy(ship: HumanShip): boolean {
    const timeFromDrop = Date.now() - this.time
    if (
      this.droppedBy === ship.id &&
      timeFromDrop < Cache.rePickUpTime
    )
      return false
    return true
  }
}
