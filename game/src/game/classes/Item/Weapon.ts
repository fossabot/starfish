import c from '../../../../../common/dist'
import { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Weapon extends Item {
  readonly range: number
  readonly damage: number
  lastUse: number = 0
  baseCooldown: number
  cooldownRemaining: number

  constructor(data: BaseWeaponData, ship: Ship) {
    super(data, ship)
    this.range = data.range
    this.damage = data.damage
    this.baseCooldown = data.baseCooldown
    this.cooldownRemaining = data.baseCooldown
  }

  use() {
    this.repair -= 0.01
    this.lastUse = Date.now()
    this.cooldownRemaining = this.baseCooldown
    super.use()
  }
}
