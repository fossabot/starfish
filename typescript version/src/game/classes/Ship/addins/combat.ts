import c from '../../../../common'
import { Item } from '../../Item/Item'
import { Ship } from '../Ship'

interface DamageResult {
  damage: number
  weapon: Item
}

interface TakenDamageResult {
  damageTaken: number
  didDie: boolean
}

export function attack(
  this: Ship,
  target: Ship,
  weapon: Item,
): DamageResult {
  c.log(`Attacking`)
  return {
    damage: 1,
    weapon: weapon,
  }
}

export function takeDamage(
  this: Ship,
  attacker: Ship,
  damage: DamageResult,
): TakenDamageResult {
  c.log(
    `Taking ${damage.damage} damage from ${attacker.name}'s ${damage.weapon.displayName}`,
  )
  this.hp -= damage.damage
  const didDie = this.hp <= 0
  return {
    damageTaken: damage.damage,
    didDie: didDie,
  }
}
