import c from '../../../common'

import { Ship } from '../Ship/Ship'

export class Item {
  readonly id: string
  readonly displayName: string
  readonly description: string
  repair = 1
  readonly ship: Ship

  constructor(
    { id, displayName, description, repair }: BaseItemData,
    ship: Ship,
  ) {
    this.id = id
    this.displayName = displayName
    this.description = description
    this.repair = repair ?? 1
    this.ship = ship
  }
}
