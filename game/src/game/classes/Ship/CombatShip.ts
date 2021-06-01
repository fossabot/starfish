import c from '../../../../../common/dist'
import io from '../../../server/io'
import { db } from '../../../db'

import { Ship } from './Ship'
import type { Weapon } from '../Item/Weapon'
import type { Item } from '../Item/Item'
import type { Engine } from '../Item/Engine'
import type { Game } from '../../Game'

interface DamageResult {
  miss: boolean
  damage: number
  weapon: Weapon
  targetType?: ItemType
}

export abstract class CombatShip extends Ship {
  static percentOfCreditsLostOnDeath = 0.5
  static percentOfCreditsDroppedOnDeath = 0.25

  attackable = true

  constructor(props: BaseShipData, game: Game) {
    super(props, game)

    this.updateAttackRadius()
  }

  updateThingsThatCouldChangeOnItemChange() {
    super.updateThingsThatCouldChangeOnItemChange()
    this.updateAttackRadius()
  }

  updateAttackRadius() {
    this.radii.attack = this.weapons.reduce(
      (highest: number, curr: Weapon): number =>
        Math.max(curr.range, highest),
      0,
    )
    this.toUpdate.radii = this.radii
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
    c.log(`Respawning`, this.name)
    this.items = []
    this.previousLocations = []
    this.equipLoadout(`humanDefault`)
    this.recalculateMaxHp()
    this.hp = this.maxHp
    this.dead = false
    this.move([
      ...(this.faction.homeworld?.location || [0, 0]),
    ])

    db.ship.addOrUpdateInDb(this)
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
      otherShip.faction.id === this.faction.id
    )
      return false
    if (
      c.distance(otherShip.location, this.location) >
      this.radii.attack
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
      return {
        damageTaken: 0,
        didDie: false,
        weapon,
        miss: true,
      }

    weapon.use()

    const totalMunitionsSkill = this.cumulativeSkillIn(
      `weapons`,
      `munitions`,
    )
    const range = c.distance(this.location, target.location)
    const rangeAsPercent = range / weapon.range
    const hitRoll = Math.random()
    let miss = hitRoll < rangeAsPercent
    const damage = miss
      ? 0
      : weapon.damage * totalMunitionsSkill * weapon.repair
    // * using repair only for damage rolls. hit rolls are unaffected to keep the excitement alive, know what I mean?
    if (damage === 0) miss = true

    c.log(
      `need to beat ${rangeAsPercent}, rolled ${hitRoll} for a ${
        miss ? `miss` : `hit`
      } of damage ${damage}`,
    )
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

    this.logEntry(
      `${attackResult.miss ? `Missed` : `Attacked`} ${
        target.name
      } with ${weapon.displayName}${
        attackResult.miss
          ? `.`
          : `, dealing ${c.r2(
              c.r2(attackResult.damageTaken),
            )} damage.`
      }${
        attackResult.didDie
          ? ` ${target.name} died in the exchange.`
          : ``
      }`,
      `high`,
    )

    return attackResult
  }

  takeDamage(
    this: CombatShip,
    attacker: CombatShip,
    attack: DamageResult,
  ): TakenDamageResult {
    const previousHp = this.hp

    let remainingDamage = attack.damage
    if (remainingDamage)
      for (let armor of this.armor) {
        const { taken, mitigated, remaining } =
          armor.blockDamage(remainingDamage)
        remainingDamage = remaining
      }
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
          // c.log(
          //   `hitting ${equipmentToAttack.displayName} with ${remainingDamage} damage`,
          // )
          equipmentToAttack.hp -= remainingDamage
          remainingDamage = 0
        } else {
          // c.log(
          //   `destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`,
          // )
          equipmentToAttack.hp = 0
          remainingDamage -= remainingHp
        }
        if (
          equipmentToAttack.hp === 0 &&
          equipmentToAttack.announceWhenBroken
        ) {
          this.logEntry(
            `Your ${equipmentToAttack.displayName} has been disabled!`,
            `high`,
          )
          attacker.logEntry(
            `You have disabled ${this.name}'s ${equipmentToAttack.displayName}!`,
            `high`,
          )
          equipmentToAttack.announceWhenBroken = false
        }
      }
    }
    this.toUpdate.items = this.items.map((i) =>
      c.stubify(i),
    )

    const didDie = previousHp > 0 && this.hp <= 0
    if (didDie) {
      this.die()
    } else this.dead = false

    c.log(
      `gray`,
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

    this.logEntry(
      `${
        attack.miss
          ? `Missed by attack from`
          : `Hit by an attack from`
      } ${attacker.name}'s ${attack.weapon.displayName}${
        attack.miss
          ? `.`
          : `, taking ${c.r2(attack.damage, 2)} damage.`
      }`,
      attack.miss ? `medium` : `high`,
    )

    return {
      miss: attack.damage === 0,
      damageTaken: attack.damage,
      didDie: didDie,
      weapon: attack.weapon,
    }
  }

  die() {
    this.dead = true
  }
}
