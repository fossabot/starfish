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
  attackable = true

  constructor(props: BaseShipData, game: Game) {
    super(props, game)

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
    c.log(`respawning`, this.name)
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
      otherShip.faction.color === this.faction.color
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
    const miss =
      Math.random() * weapon.repair > rangeAsPercent
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

    this.logEntry(
      `${attackResult.miss ? `Missed` : `Attacked`} ${
        target.name
      } with ${weapon.displayName}${
        attackResult.miss
          ? `.`
          : `, dealing ${attackResult.damageTaken} damage.`
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
        if (equipmentToAttack.hp === 0) {
          this.logEntry(
            `Your ${equipmentToAttack.displayName} has been disabled!`,
            `high`,
          )
        }
      }
    }
    this.toUpdate.weapons = c.stubify<
      Weapon[],
      WeaponStub[]
    >(this.weapons)
    this.toUpdate.engines = c.stubify<
      Engine[],
      EngineStub[]
    >(this.engines)

    const didDie = previousHp > 0 && this.hp <= 0
    if (didDie) {
      // ----- notify listeners -----
      io.to(`ship:${this.id}`).emit(
        `ship:die`,
        c.stubify<Ship, ShipStub>(this),
      )

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
          : `, taking ${attack.damage} damage.`
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

    setTimeout(() => {
      this.logEntry(
        `Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`,
        `critical`,
      )
    }, 100)

    const cacheContents: CacheContents[] = []

    this.crewMembers.forEach((cm) => {
      while (cm.inventory.length) {
        const toAdd = cm.inventory.pop()
        const existing = cacheContents.find(
          (cc) => cc.type === toAdd?.type,
        )
        if (existing) existing.amount += toAdd?.amount || 0
        else if (toAdd) cacheContents.push(toAdd)
      }

      cm.credits *= 0.5
      const existing = cacheContents.find(
        (cc) => cc.type === `credits`,
      )
      if (existing) existing.amount += cm.credits || 0
      else if (cm.credits)
        cacheContents.push({
          type: `credits`,
          amount: cm.credits,
        })

      cm.location = `bunk`
    })

    if (cacheContents.length)
      this.game.addCache({
        contents: cacheContents,
        location: this.location,
        ownerId: this.id,
        message: `Remains of ${this.name}`,
      })
  }
}
