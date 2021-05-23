import c from '../../../../../common/dist'

import type { Ship } from '../Ship/Ship'

export class Item {
  readonly type: ItemType
  readonly id: string
  readonly displayName: string
  readonly description: string
  repair = 1
  maxHp: number
  readonly ship: Ship
  announceWhenRepaired = false
  announceWhenBroken = true

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
    props?: Partial<BaseItemData>,
  ) {
    this.type = type
    this.id = id
    this.displayName = displayName
    this.description = description
    this.repair = repair ?? props?.repair ?? 1
    this.ship = ship
    this.maxHp = maxHp
    if (hp !== undefined) this.hp = hp
    if (props?.hp !== undefined) this.hp = props?.hp
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
    this.ship.toUpdate._hp = this.ship.hp
  }
}
