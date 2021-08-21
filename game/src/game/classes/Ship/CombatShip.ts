import c from '../../../../../common/dist'
import io from '../../../server/io'
import { db } from '../../../db'

import { Ship } from './Ship'
import { Zone } from '../Zone'
import type { Weapon } from '../Item/Weapon'
import type { Item } from '../Item/Item'
import type { Engine } from '../Item/Engine'
import type { Game } from '../../Game'

interface DamageResult {
  miss: boolean
  damage: number
  weapon?: Weapon
  targetType?: ItemType
}

export abstract class CombatShip extends Ship {
  static percentOfCreditsLostOnDeath = 0.5
  static percentOfCreditsDroppedOnDeath = 0.25

  attackable = true

  constructor(props: BaseShipData, game: Game) {
    super(props, game)

    this.species.passives.forEach((p) =>
      this.applyPassive(p),
    )

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

  applyPassive(p: ShipPassiveEffect) {
    this.passives.push(p)
    this.updateThingsThatCouldChangeOnItemChange()
    this.updateAttackRadius()
    this.updateMaxScanProperties()
    this.updateSlots()
    this.toUpdate.passives = this.passives
  }

  removePassive(p: ShipPassiveEffect) {
    const index = this.passives.findIndex(
      (ep: ShipPassiveEffect) => {
        for (let key in ep)
          if (ep[key] !== p[key]) return false
        return true
      },
    )
    if (index === -1) return
    c.log(`removing passive`, p)
    this.passives.splice(index, 1)
    this.updateThingsThatCouldChangeOnItemChange()
    this.updateAttackRadius()
    this.updateMaxScanProperties()
    this.updateSlots()
    this.toUpdate.passives = this.passives
  }

  applyZoneTickEffects() {
    this.visible.zones
      .filter((z) =>
        c.pointIsInsideCircle(
          z.location,
          this.location,
          z.radius,
        ),
      )
      .forEach((z) => z.affectShip(this))
  }

  availableWeapons(): Weapon[] {
    return this.weapons.filter(
      (w) => w.cooldownRemaining <= 0,
    )
  }

  getEnemiesInAttackRange(): CombatShip[] {
    const combatShipsInRange = (
      this.visible.ships as ShipStub[]
    )
      .map((s) =>
        this.game.ships.find((ship) => ship.id === s.id),
      )
      .filter(
        (s) => s && this.canAttack(s, true),
      ) as CombatShip[]
    return combatShipsInRange
  }

  respawn() {
    c.log(`Respawning`, this.name)
    this.items = []
    this.previousLocations = []
    this.recalculateMaxHp()
    this.hp = this.maxHp
    this.dead = false
    this.move(
      [...(this.faction.homeworld?.location || [0, 0])].map(
        (pos) => pos + c.randomBetween(-0.00001, 0.00001),
      ) as CoordinatePair,
    )

    db.ship.addOrUpdateInDb(this)
  }

  canAttack(
    this: CombatShip,
    otherShip: Ship,
    ignoreWeaponState = false,
  ): boolean {
    if (this === otherShip) return false
    if (!otherShip.attackable) return false
    if (otherShip.planet || this.planet) return false
    if (otherShip.dead || this.dead) return false
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
    const enemyAgility =
      target.chassis.agility +
      (target.passives.find(
        (p) => p.id === `boostChassisAgility`,
      )?.intensity || 0)
    const hitRoll = Math.random()
    let miss = hitRoll * enemyAgility < rangeAsPercent
    // todo this makes it impossible to hit some ships even when they're "in range"... fix
    let damage = miss
      ? 0
      : c.getHitDamage(weapon, totalMunitionsSkill)

    // apply passive
    const relevantPassives =
      this.passives.filter(
        (p) =>
          p.id ===
          `boostAttackWithNumberOfFactionMembersWithinDistance`,
      ) || []
    let passiveDamageMultiplier = relevantPassives.reduce(
      (total: number, p: ShipPassiveEffect) =>
        total + (p.intensity || 0),
      0,
    )
    if (passiveDamageMultiplier) {
      let factionMembersInRange = 0
      const range = relevantPassives.reduce(
        (avg, curr) =>
          avg +
          (curr.distance || 0) / relevantPassives.length,
        0,
      )
      this.visible.ships.forEach((s: any) => {
        if (
          s?.faction?.id === this.faction.id &&
          c.distance(s.location, this.location) <= range
        )
          factionMembersInRange++
      })
      passiveDamageMultiplier *= factionMembersInRange
      c.log(
        `damage boosted from passive by`,
        passiveDamageMultiplier,
        `because there are`,
        factionMembersInRange,
        `faction members within`,
        range,
      )
      damage *= 1 + passiveDamageMultiplier
    }

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
      onlyVisibleToShipId: this.tutorial
        ? this.id
        : target.tutorial
        ? target.id
        : undefined,
    })

    if (attackResult.miss)
      this.logEntry(
        [
          `Missed`,
          {
            text: target.name,
            color: target.faction.color,
            tooltipData: {
              type: `ship`,
              name: target.name,
              faction: target.faction.id,
              species: target.species.id,
              tagline: target.tagline,
              headerBackground: target.headerBackground,
            },
          },
          `with`,
          {
            text: weapon.displayName,
            tooltipData: weapon.stubify(),
          },
          `&nospace.`,
        ],
        `high`,
      )
    else
      this.logEntry(
        [
          `Attacked`,
          {
            text: target.name,
            color: target.faction.color,
            tooltipData: {
              type: `ship`,
              name: target.name,
              faction: target.faction.id,
              species: target.species.id,
              tagline: target.tagline,
              headerBackground: target.headerBackground,
            },
          },
          `with`,
          {
            text: weapon.displayName,
            tooltipData: weapon.stubify(),
          },
          `&nospace, dealing`,
          {
            text:
              c.r2(c.r2(attackResult.damageTaken)) +
              ` damage`,
            tooltipData: {
              type: `damage`,
              ...attackResult,
            },
          },
          `&nospace.`,
          attackResult.didDie
            ? `${target.name} died in the exchange.`
            : ``,
        ],
        `high`,
      )

    this.addStat(`damageDealt`, attackResult.damageTaken)
    if (attackResult.didDie) {
      this.addStat(`kills`, 1)
      this.addHeaderBackground(
        `Stone Cold 1`,
        `destroying an enemy ship`,
      )
    }

    return attackResult
  }

  takeDamage(
    this: CombatShip,
    attacker: { name: string; [key: string]: any },
    attack: DamageResult,
  ): TakenDamageResult {
    const previousHp = this.hp

    let remainingDamage = attack.damage

    // ----- apply passives -----
    // scaled damage reduction
    const passiveDamageMultiplier = Math.max(
      0,
      1 -
        this.passives
          .filter((p) => p.id === `scaledDamageReduction`)
          .reduce(
            (total, p) => total + (p.intensity || 0),
            0,
          ),
    )
    remainingDamage *= passiveDamageMultiplier

    // flat damage reduction
    const flatDamageReduction = this.passives
      .filter((p) => p.id === `flatDamageReduction`)
      .reduce((total, p) => total + (p.intensity || 0), 0)
    remainingDamage -= flatDamageReduction
    if (remainingDamage < 0) remainingDamage = 0

    const attackDamageAfterPassives = remainingDamage

    // calculate passive item type damage boosts from attacker
    let itemTypeDamageMultipliers: {
      [key in ItemType]?: number
    } = {}
    ;(
      attacker.passives?.filter(
        (p: ShipPassiveEffect) =>
          p.id === `boostDamageToItemType`,
      ) || []
    ).forEach((p: ShipPassiveEffect) => {
      if (!itemTypeDamageMultipliers[p.type as ItemType])
        itemTypeDamageMultipliers[p.type as ItemType] =
          1 + (p.intensity || 0)
      else
        itemTypeDamageMultipliers[p.type as ItemType]! +=
          p.intensity || 0
    })

    let totalDamageDealt = 0
    const damageTally: {
      targetType: string
      targetDisplayName: string
      damage: number
      damageBlocked?: number
      destroyed: boolean
    }[] = []

    // ----- hit armor first -----
    if (remainingDamage)
      for (let armor of this.armor) {
        let adjustedRemainingDamage = remainingDamage
        if (itemTypeDamageMultipliers.armor)
          adjustedRemainingDamage *=
            itemTypeDamageMultipliers.armor
        const { remaining, taken } = armor.blockDamage(
          adjustedRemainingDamage,
        )
        totalDamageDealt += taken
        const damageRemovedFromTotal =
          adjustedRemainingDamage - remaining
        remainingDamage -= damageRemovedFromTotal
        if (armor.hp === 0 && armor.announceWhenBroken) {
          this.logEntry(
            [
              `Your`,
              {
                text: armor.displayName,
                color: `var(--item)`,
                tooltipData: armor.stubify(),
              },
              `has been broken!`,
            ],
            `high`,
          )
          if (`logEntry` in attacker)
            attacker.logEntry(
              [
                `You have broken through`,
                {
                  text: this.name,
                  color: this.faction.color,
                  tooltipData: {
                    type: `ship`,
                    name: this.name,
                    faction: this.faction.id,
                    species: this.species.id,
                    tagline: this.tagline,
                    headerBackground: this.headerBackground,
                  },
                },
                `&nospace's`,
                {
                  text: armor.displayName,
                  color: `var(--item)`,
                  tooltipData: armor.stubify(),
                },
                `&nospace!`,
              ],
              `high`,
            )
          armor.announceWhenBroken = false
        }
        damageTally.push({
          targetType: `armor`,
          targetDisplayName: armor.displayName,
          damage: taken,
          damageBlocked: damageRemovedFromTotal,
          destroyed: armor.hp === 0,
        })
      }

    // ----- distribute remaining damage -----
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
      // nothing to attack, so we're done
      if (!attackableEquipment.length) {
        remainingDamage = 0
        break
      }

      const equipmentToAttack: Item = c.randomFromArray(
        attackableEquipment,
      )

      // apply passive damage boost to item types
      let adjustedRemainingDamage = remainingDamage
      if (
        itemTypeDamageMultipliers[
          equipmentToAttack.type
        ] !== undefined
      ) {
        adjustedRemainingDamage *=
          itemTypeDamageMultipliers[equipmentToAttack.type]!
        c.log(
          `damage to`,
          equipmentToAttack.type,
          `boosted by passive:`,
          remainingDamage,
          `became`,
          adjustedRemainingDamage,
        )
      }

      const remainingHp = equipmentToAttack.hp
      // ----- item not destroyed -----
      if (remainingHp >= adjustedRemainingDamage) {
        c.log(
          `hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage`,
        )
        equipmentToAttack.hp -= adjustedRemainingDamage
        equipmentToAttack._stub = null
        remainingDamage = 0
        totalDamageDealt += adjustedRemainingDamage
        damageTally.push({
          targetType: equipmentToAttack.type,
          targetDisplayName: equipmentToAttack.displayName,
          damage: adjustedRemainingDamage,
          destroyed: false,
        })
      }
      // ----- item destroyed -----
      else {
        c.log(
          `destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`,
        )
        equipmentToAttack.hp = 0
        equipmentToAttack._stub = null
        remainingDamage -= remainingHp
        totalDamageDealt += remainingHp
        damageTally.push({
          targetType: equipmentToAttack.type,
          targetDisplayName: equipmentToAttack.displayName,
          damage: remainingHp,
          destroyed: true,
        })
      }

      // ----- notify both sides -----
      if (
        equipmentToAttack.hp === 0 &&
        equipmentToAttack.announceWhenBroken
      ) {
        this.logEntry(
          [
            `Your`,
            {
              text: equipmentToAttack.displayName,
              color: `var(--item)`,
              tooltipData: equipmentToAttack.stubify(),
            },
            `has been disabled!`,
          ],
          `high`,
        )
        if (`logEntry` in attacker)
          attacker.logEntry(
            [
              `You have disabled`,
              {
                text: this.name,
                color: this.faction.color,
                tooltipData: {
                  type: `ship`,
                  name: this.name,
                  faction: this.faction.id,
                  species: this.species.id,
                  tagline: this.tagline,
                  headerBackground: this.headerBackground,
                },
              },
              `&nospace's`,
              {
                text: equipmentToAttack.displayName,
                color: `var(--item)`,
                tooltipData: equipmentToAttack.stubify(),
              },
              `&nospace!`,
            ],
            `high`,
          )
        equipmentToAttack.announceWhenBroken = false
      }
    }
    this.toUpdate.items = this.items.map((i) =>
      c.stubify(i),
    )

    const didDie = previousHp > 0 && this.hp <= 0
    if (didDie)
      this.die(
        attacker instanceof CombatShip
          ? attacker
          : undefined,
      )

    this.addStat(`damageTaken`, totalDamageDealt)

    c.log(
      `gray`,
      `${this.name} takes ${c.r2(
        totalDamageDealt,
      )} damage from ${attacker.name}'s ${
        attack.weapon
          ? attack.weapon.displayName
          : `passive effect`
      }, and ${
        didDie ? `dies` : `has ${this.hp} hp left`
      }.`,
    )

    this.toUpdate._hp = this.hp
    this.toUpdate.dead = this.dead

    const damageResult = {
      miss: attackDamageAfterPassives === 0,
      damageTaken: totalDamageDealt,
      didDie: didDie,
      weapon: attack.weapon?.stubify(),
      damageTally,
    }

    // ship damage
    if (attack.weapon)
      this.logEntry(
        [
          attack.miss
            ? `Missed by an attack from`
            : `Hit by an attack from`,
          {
            text: attacker.name,
            color: attacker.faction.color,
            tooltipData: {
              type: `ship`,
              name: attacker.name,
              faction: attacker.faction.id,
              species: attacker.species.id,
              tagline: attacker.tagline,
              headerBackground: attacker.headerBackground,
            },
          },
          `&nospace's`,
          {
            text: attack.weapon.displayName,
            color: `var(--item)`,
            tooltipData: {
              type: `weapon`,
              damage: attack.weapon.damage,
              description: attack.weapon.description,
              range: attack.weapon.range,
              displayName: attack.weapon.displayName,
              id: attack.weapon.id,
              mass: attack.weapon.mass,
            },
          },
          `&nospace.`,
          ...(attack.miss
            ? [``]
            : ([
                `You took`,
                {
                  text: `${c.r2(totalDamageDealt)} damage`,
                  color: `var(--warning)`,
                  tooltipData: {
                    type: `damage`,
                    ...damageResult,
                  },
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss ? `medium` : `high`,
      )
    // zone or passive damage
    else
      this.logEntry(
        [
          attack.miss ? `Missed by` : `Hit by`,
          {
            text: attacker.name,
            color: attacker.color || `red`,
            tooltipData: attacker.stubify
              ? attacker.stubify()
              : undefined,
          },
          `&nospace.`,
          ...(attack.miss
            ? [``]
            : ([
                `You took`,
                {
                  text: `${c.r2(totalDamageDealt)} damage`,
                  color: `var(--warning)`,
                  tooltipData: {
                    type: `damage`,
                    ...damageResult,
                  },
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss ? `medium` : `high`,
      )

    return damageResult
  }

  die(attacker?: CombatShip) {
    this.addStat(`deaths`, 1)
    this.dead = true
  }
}
