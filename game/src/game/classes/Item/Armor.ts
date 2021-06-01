import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Armor extends Item {
  readonly id: ArmorId
  readonly damageReduction: number

  constructor(
    data: BaseArmorData,
    ship: Ship,
    props?: Partial<BaseArmorData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.damageReduction = data.damageReduction
  }

  blockDamage(totalDamage: number) {
    const amountMitigated =
      totalDamage * this.damageReduction * this.repair
    let remainingDamage = totalDamage - amountMitigated
    const damageTaken = Math.min(this.hp, remainingDamage)
    this.hp -= damageTaken
    remainingDamage -= damageTaken
    // c.log(
    //   `Armor blocked ${amountMitigated} and took ${damageTaken} damage, leaving it with ${this.hp} hp.`,
    // )
    return {
      taken: damageTaken,
      mitigated: amountMitigated,
      remaining: remainingDamage,
    }
  }
}
