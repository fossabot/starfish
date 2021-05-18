import c from '../../../../../common/dist'
import { io, stubify } from '../../../server/io'
import { Ship } from './Ship'
import type { Weapon } from '../Item/Weapon'
import type { Item } from '../Item/Item'
import { Engine } from '../Item/Engine'

interface DamageResult {
  miss: boolean
  damage: number
  weapon: Weapon
  targetType?: ItemType
}

export abstract class CombatShip extends Ship {
  attackable = true

  attackRange(): number {
    return this.weapons.reduce(
      (highest: number, curr: Weapon): number =>
        Math.max(curr.range, highest),
      0,
    )
  }

  availableWeapons(): Weapon[] {
    return this.weapons.filter(
      (w) => w.cooldownRemaining <= 0,
    )
  }

  getEnemiesInAttackRange(): CombatShip[] {
    const combatShipsInRange = this.visible.ships.filter(
      (s) => this.canAttack(s, true),
    ) as CombatShip[]
    return combatShipsInRange
  }

  respawn() {
    while (this.weapons.length) this.weapons.pop()
    while (this.engines.length) this.engines.pop()
    this.equipLoadout(`human_default`)
    this.recalculateMaxHp()
    this.hp = this.maxHp
    this.dead = false
    let moveTo: CoordinatePair
    if (this.faction) {
      moveTo = [
        ...(this.faction.homeworld?.location || [0, 0]),
      ]
    } else moveTo = [0, 0]
    this.move(moveTo)
    while (this.previousLocations.length)
      this.previousLocations.pop()
  }

  canAttack(
    this: CombatShip,
    otherShip: Ship,
    ignoreWeaponState = false,
  ): boolean {
    if (!(otherShip instanceof CombatShip)) return false
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
    if (
      !ignoreWeaponState &&
      !this.availableWeapons().length
    )
      return false
    return true
  }

  attack(
    this: CombatShip,
    target: CombatShip,
    weapon: Weapon,
    targetType?: ItemType,
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
      targetType,
    }
    const attackResult = target.takeDamage(
      this,
      damageResult,
    )

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

  takeDamage(
    this: CombatShip,
    attacker: CombatShip,
    attack: DamageResult,
  ): TakenDamageResult {
    const previousHp = this.hp

    let remainingDamage = attack.damage
    while (remainingDamage > 0) {
      let attackableEquipment: Item[] = []
      if (attack.targetType)
        attackableEquipment = this.items.filter(
          (i) =>
            i.repair > 0 && i.type === attack.targetType,
        )
      if (!attackableEquipment.length)
        attackableEquipment = this.items.filter(
          (i) => i.repair > 0,
        )
      if (!attackableEquipment.length) remainingDamage = 0
      else {
        const equipmentToAttack: Item = c.randomFromArray(
          attackableEquipment,
        )
        const remainingHp = equipmentToAttack.hp
        if (remainingHp >= remainingDamage) {
          equipmentToAttack.hp -= remainingDamage
          remainingDamage = 0
        } else {
          equipmentToAttack.hp = 0
          remainingDamage -= remainingHp
        }
      }
    }
    this.toUpdate.weapons = stubify<Weapon[], WeaponStub[]>(
      this.weapons,
    )
    this.toUpdate.engines = stubify<Engine[], EngineStub[]>(
      this.engines,
    )

    const didDie = previousHp > 0 && this.hp <= 0
    if (didDie) {
      // ----- notify listeners -----
      io.to(`ship:${this.id}`).emit(
        `ship:die`,
        stubify<Ship, ShipStub>(this),
      )

      this.dead = true
    } else this.dead = false

    c.log(
      `${this.name} takes ${attack.damage} damage from ${
        attacker.name
      }'s ${attack.weapon.displayName}, and ${
        didDie ? `dies` : `has ${this.hp} hp left`
      }.`,
    )

    // ----- notify listeners -----
    io.to(`ship:${this.id}`).emit(`ship:update`, {
      id: this.id,
      updates: { dead: this.dead, _hp: this.hp },
    })

    this.toUpdate._hp = this.hp

    return {
      damageTaken: attack.damage,
      didDie: didDie,
      weapon: attack.weapon,
    }
  }
}
