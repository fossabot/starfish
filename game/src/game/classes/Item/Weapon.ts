import c from '../../../../../common/dist'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Weapon extends Item {
  readonly id: WeaponId
  readonly range: number
  readonly damage: number
  readonly critChance: number = 0
  lastUse: number = 0
  baseCooldown: number
  cooldownRemaining: number
  rooms: CrewLocation[] = [`weapons`]

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
    if (data.critChance !== undefined)
      this.critChance = data.critChance
    this.cooldownRemaining =
      data.cooldownRemaining ||
      props?.cooldownRemaining ||
      0
    if (this.cooldownRemaining > this.baseCooldown)
      this.cooldownRemaining = this.baseCooldown
  }

  get effectiveRange(): number {
    return this.range * this.repair
  }

  use(usePercent: number = 1, users?: CrewMember[]) {
    this.cooldownRemaining = this.baseCooldown
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    const avgLevel =
      (users?.reduce(
        (acc, user) =>
          acc +
          (user.skills.find((s) => s.skill === `munitions`)
            ?.level || 1),
        0,
      ) || 1) / (users?.length || 1)

    let repairLoss =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
        avgLevel,
      ) * 200
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    repairLoss += super.use()
    return repairLoss
  }
}
