import c from '../../../../../../common/dist'
import type { CrewMember } from '../../CrewMember/CrewMember'
import type { Ship } from '../Ship'
import type { CombatShip } from '../CombatShip'

import { Item } from './Item'

export class Weapon extends Item {
  range: number
  damage: number
  critChance: number = 0
  slowingFactor: number = 0
  lastUse: number = 0
  chargeRequired: number
  cooldownRemaining: number
  rooms: CrewLocation[] = [`weapons`]

  constructor(
    data: BaseWeaponData,
    ship: Ship,
    props?: Partial<BaseWeaponData>,
  ) {
    super(data, ship, props)
    this.range = data.range
    this.damage = data.damage
    this.chargeRequired = data.chargeRequired
    this.lastUse = data.lastUse || 0
    if (data.critChance !== undefined) this.critChance = data.critChance
    if (data.slowingFactor !== undefined)
      this.slowingFactor = data.slowingFactor
    this.cooldownRemaining =
      data.cooldownRemaining || props?.cooldownRemaining || 0
    if (this.cooldownRemaining > this.chargeRequired)
      this.cooldownRemaining = this.chargeRequired
  }

  get effectiveRange(): number {
    return this.range * this.repair
  }

  use(usePercent: number = 1, users?: CrewMember[]) {
    this.cooldownRemaining = this.chargeRequired
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair) return 0

    const avgLevel =
      (users?.reduce((acc, user) => acc + user.strength.level, 0) || 1) /
      (users?.length || 1)

    let repairLoss =
      c.getBaseDurabilityLossPerTick(this.maxHp, this.reliability, avgLevel) *
      400
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    repairLoss += super.use()
    ;(this.ship as CombatShip).updateAttackRadius?.()
    return repairLoss
  }
}
