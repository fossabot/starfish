import c from '../../../../../common/dist'

import { Ship } from '../Ship/Ship'

export class Item {
  readonly type: ItemType
  readonly id: string
  readonly displayName: string
  readonly description: string
  repair = 1
  maxHp: number
  readonly ship: Ship

  constructor(
    {
      type,
      id,
      displayName,
      description,
      repair,
      maxHp,
      hp,
    }: BaseItemData,
    ship: Ship,
  ) {
    this.type = type
    this.id = id
    this.displayName = displayName
    this.description = description
    this.repair = repair ?? 1
    this.ship = ship
    this.maxHp = maxHp
    if (hp !== undefined) this.hp = hp
  }

  get hp(): number {
    return this.repair * this.maxHp
  }

  set hp(newHp: number) {
    this.repair = newHp / this.maxHp
  }

  use() {
    this.repair -= 0.00005
    if (this.repair < 0) this.repair = 0
  }
}
