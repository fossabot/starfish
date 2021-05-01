import c from '../../../../../../common/dist'
import { Item } from '../../Item/Item'
import { Ship } from '../Ship'
import { CombatShip } from '../CombatShip'
import { Weapon } from '../../Item/Weapon'

export function canAttack(
  this: CombatShip,
  otherShip: Ship,
): boolean {
  if (!otherShip?.attackable) return false
  if (otherShip.hp <= 0) return false
  if (
    otherShip.faction &&
    otherShip.faction.color === this.faction?.color
  )
    return false
  if (otherShip.planet) return false
  if (
    c.distance(otherShip.location, this.location) >
    this.attackRange
  )
    return false
  if (!this.availableWeapons.length) return false
  return true
}

interface DamageResult {
  damage: number
  weapon: Weapon
}
export function attack(
  this: CombatShip,
  target: CombatShip,
  weapon: Weapon,
): TakenDamageResult {
  if (!this.canAttack(target))
    return { damageTaken: 0, didDie: false, weapon }

  weapon.lastUse = Date.now()
  const damageResult = {
    damage: 1,
    weapon,
  }
  const attackResult = target.takeDamage(this, damageResult)
  return attackResult
}

export function takeDamage(
  this: CombatShip,
  attacker: CombatShip,
  damage: DamageResult,
): TakenDamageResult {
  const previousHp = this.hp
  this.hp -= damage.damage
  const didDie = previousHp > 0 && this.hp <= 0
  if (didDie) this.dead = true
  c.log(
    `${this.name} takes ${damage.damage} damage from ${
      attacker.name
    }'s ${damage.weapon.displayName}, and ${
      didDie ? `died` : `has ${this.hp} hp left`
    }.`,
  )
  return {
    damageTaken: damage.damage,
    didDie: didDie,
    weapon: damage.weapon,
  }
}
