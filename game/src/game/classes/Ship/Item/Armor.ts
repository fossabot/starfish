import c from '../../../../../../common/dist'
import type { Ship } from '../Ship'

import { Item } from './Item'

export class Armor extends Item {
  damageReduction: number

  constructor(
    data: BaseArmorData,
    ship: Ship,
    props?: Partial<BaseArmorData>,
  ) {
    super(data, ship, props)
    this.damageReduction = data.damageReduction
  }

  blockDamage(totalDamage: number) {
    const startHp = this.hp
    const amountMitigated =
      totalDamage * this.damageReduction * this.repair
    let remainingDamage = totalDamage - amountMitigated
    const damageTaken = Math.min(this.hp, remainingDamage)
    this.hp -= damageTaken
    if (this.hp < 0.00001) this.hp = 0
    remainingDamage -= damageTaken
    // c.log(
    //   `Armor blocked ${amountMitigated} and took ${damageTaken} damage, leaving it with ${this.hp} hp.`,
    // )
    return {
      taken: damageTaken,
      mitigated: amountMitigated,
      remaining: remainingDamage,
      destroyed: this.hp === 0 && startHp > this.hp,
    }
  }
}
