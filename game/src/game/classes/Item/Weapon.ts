import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Weapon extends Item {
  readonly id: WeaponId
  readonly range: number
  readonly damage: number
  lastUse: number = 0
  baseCooldown: number
  cooldownRemaining: number

  constructor(
    data: BaseWeaponData,
    ship: Ship,
    props?: Partial<BaseWeaponData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.range = data.range
    this.damage = data.damage
    this.baseCooldown = data.baseCooldown
    this.lastUse = data.lastUse || 0
    this.cooldownRemaining =
      data.cooldownRemaining ||
      props?.cooldownRemaining ||
      data.baseCooldown
  }

  use() {
    this.cooldownRemaining = this.baseCooldown
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    let repairLoss =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) * 150
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    repairLoss += super.use()
    return repairLoss
  }
}
