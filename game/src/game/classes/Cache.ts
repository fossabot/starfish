import c from '../../../../common/dist'

import type { Game } from '../Game'
import type { HumanShip } from './Ship/HumanShip/HumanShip'
import { Stubbable } from './Stubbable'

export class Cache extends Stubbable {
  static readonly rePickUpTime = 1000 * 60 * 30 // 30 minutes

  readonly type = `cache`
  readonly id: string
  readonly contents: CacheContents[]
  location: CoordinatePair
  readonly message: string = ``
  readonly time: number = Date.now()
  readonly game: Game
  readonly droppedBy: string | undefined
  readonly onlyVisibleToShipId?: string

  constructor(
    {
      contents,
      location,
      message,
      time,
      id,
      droppedBy,
      onlyVisibleToShipId,
    }: BaseCacheData,
    game: Game,
  ) {
    super()
    this.game = game
    this.contents = contents
    this.location = location
    if (message) this.message = message
    if (time) this.time = time
    this.id =
      id || `cache` + `${Math.random()}`.substring(2)
    this.droppedBy = droppedBy
    if (onlyVisibleToShipId)
      this.onlyVisibleToShipId = onlyVisibleToShipId
  }

  canBePickedUpBy(
    ship: HumanShip,
    ignoreTime: boolean = false,
  ): boolean {
    if (this.onlyVisibleToShipId)
      return this.onlyVisibleToShipId === ship.id

    const timeFromDrop = Date.now() - this.time
    if (
      !ignoreTime &&
      this.droppedBy === ship.id &&
      timeFromDrop < Cache.rePickUpTime
    )
      return false

    return true
  }

  toAdminStub(): CacheStub {
    return this.stubify()
  }
}
