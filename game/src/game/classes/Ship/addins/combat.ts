import c from '../../../../../../common/dist'
import { io, stubify } from '../../../../server/io'

import { Item } from '../../Item/Item'
import { Ship } from '../Ship'
import { CombatShip } from '../CombatShip'
import { Weapon } from '../../Item/Weapon'

export function canAttack(
  this: CombatShip,
  otherShip: Ship,
): boolean {
  if (otherShip.planet || this.planet) return false
  if (otherShip.dead || this.dead) return false
  if (!otherShip?.attackable) return false
  if (
    otherShip.faction &&
    this.faction &&
    otherShip.faction.color === this.faction.color
  )
    return false
  if (
    c.distance(otherShip.location, this.location) >
    this.attackRange()
  )
    return false
  if (!this.availableWeapons().length) return false
  return true
}

interface DamageResult {
  miss: boolean
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

  weapon.use()

  const totalMunitionsSkill = this.cumulativeSkillIn(
    `weapons`,
    `munitions`,
  )
  const range = c.distance(this.location, target.location)
  const rangeAsPercent = range / weapon.range
  const miss = Math.random() > rangeAsPercent
  const damage = miss
    ? 0
    : weapon.damage * totalMunitionsSkill
  const damageResult: DamageResult = {
    miss,
    damage,
    weapon,
  }
  const attackResult = target.takeDamage(this, damageResult)

  this.game.addAttackRemnant({
    attacker: this,
    defender: target,
    damageTaken: attackResult,
    start: [...this.location],
    end: [...target.location],
    time: Date.now(),
  })

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
  c.log(
    `${this.name} takes ${damage.damage} damage from ${
      attacker.name
    }'s ${damage.weapon.displayName}, and ${
      didDie ? `dies` : `has ${this.hp} hp left`
    }.`,
  )

  // ----- notify listeners -----
  io.to(`ship:${this.id}`).emit(`ship:update`, {
    id: this.id,
    updates: { dead: this.dead, _hp: this._hp },
  })

  return {
    damageTaken: damage.damage,
    didDie: didDie,
    weapon: damage.weapon,
  }
}
