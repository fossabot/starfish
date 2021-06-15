import c from '../../../../../common/dist'

import type { Ship } from '../Ship/Ship'
import { Stubbable } from '../Stubbable'

export class Item extends Stubbable {
  readonly type: ItemType
  readonly id: ItemId
  readonly displayName: string
  readonly description: string
  readonly mass: number = 1000
  readonly repairDifficulty: number = 1
  readonly reliability: number = 1 // higher loses less repair over time
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
      mass,
      repair,
      maxHp,
      hp,
      repairDifficulty,
      reliability,
    }: BaseItemData,
    ship: Ship,
    props?: Partial<BaseItemData>,
  ) {
    super()
    this.type = type
    this.id = id
    this.displayName = displayName
    this.description = description
    this.mass = mass
    if (reliability) this.reliability = reliability
    if (repairDifficulty)
      this.repairDifficulty = repairDifficulty
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

  use(usePercent: number = 1) {
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0
    const durabilityLost =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) * usePercent
    this.repair -= durabilityLost
    if (this.repair < 0) this.repair = 0
    this.ship.toUpdate._hp = this.ship.hp

    this._stub = null // invalidate stub

    return durabilityLost
  }
}
