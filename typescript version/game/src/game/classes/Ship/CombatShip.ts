import c from '../../../../../common/dist'
import { Ship } from './Ship'
import { Weapon } from '../Item/Weapon'

import {
  attack,
  takeDamage,
  canAttack,
} from './addins/combat'

export class CombatShip extends Ship {
  attackable = true
  hp = 10

  get attackRange(): number {
    return this.weapons.reduce(
      (highest: number, curr: Weapon): number =>
        Math.max(curr.range, highest),
      0,
    )
  }

  get availableWeapons(): Weapon[] {
    const now = Date.now()
    return this.weapons.filter(
      (w) => now - w.lastUse > w.cooldownInMs,
    )
  }

  get enemiesInAttackRange(): CombatShip[] {
    const allShipsInRange = this.game.scanCircle(
      this.location,
      this.attackRange,
      `ship`,
    ).ships
    const combatShipsInRange = allShipsInRange.filter(
      (s: any) => s instanceof CombatShip,
    ) as CombatShip[]
    return combatShipsInRange.filter((s) =>
      this.canAttack(s),
    )
  }

  attack = attack
  takeDamage = takeDamage
  canAttack = canAttack
}
