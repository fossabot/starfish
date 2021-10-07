import c from '../../../../../common/dist'
import io from '../../../server/io'
import { db } from '../../../db'

import { Ship } from './Ship'
import type { Weapon } from '../Item/Weapon'
import type { Item } from '../Item/Item'
import type { Engine } from '../Item/Engine'
import type { Game } from '../../Game'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { HumanShip } from './HumanShip'

export abstract class CombatShip extends Ship {
  static percentOfCreditsLostOnDeath = 0.5
  static percentOfCreditsDroppedOnDeath = 0.25

  targetShip: CombatShip | null = null
  targetItemType: ItemType | `any` = `any`
  combatTactic: CombatTactic = `defensive`
  attackable = true

  constructor(props: BaseShipData, game: Game) {
    super(props, game)

    this.updateAttackRadius()
  }

  // move(toLocation?: CoordinatePair) {
  //   const previousLocation: CoordinatePair = [
  //     ...this.location,
  //   ]
  //   super.move(toLocation)
  //   // * this does nothing yet, just chilling
  // }

  updateThingsThatCouldChangeOnItemChange() {
    super.updateThingsThatCouldChangeOnItemChange()
    this.updateAttackRadius()
  }

  updateAttackRadius() {
    this.radii.attack = this.weapons.reduce(
      (highest: number, curr: Weapon): number =>
        Math.max(curr.effectiveRange, highest),
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
    let index
    if (p.data?.source?.planetName)
      index = this.passives.findIndex(
        (ep: ShipPassiveEffect) => {
          for (let key in ep) {
            if (ep[key] !== p[key]) return false
            if (
              ep.data?.source?.planetName !==
              p.data?.source?.planetName
            )
              return false
          }
          return true
        },
      )
    else
      index = this.passives.findIndex(
        (ep: ShipPassiveEffect) => {
          for (let key in ep)
            if (ep[key] !== p[key]) return false
          return true
        },
      )
    if (index === -1) return
    // c.log(`removing passive`, p)
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
        (s) =>
          s &&
          (!this.onlyVisibleToShipId ||
            s.id === this.onlyVisibleToShipId),
      )
      .filter(
        (s) => s && this.canAttack(s, true),
      ) as CombatShip[]
    return combatShipsInRange
  }

  recalculateTargetShip(): CombatShip | null {
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) {
      this.targetShip = null
      return this.targetShip
    }

    this.targetShip = c.randomFromArray(
      enemies,
    ) as CombatShip

    return this.targetShip
  }

  async respawn() {
    c.log(`Respawning`, this.name)
    this.items = []
    this.previousLocations = []
    this.recalculateMaxHp()
    this.hp = this.maxHp
    this.dead = false
    this.move(
      [
        ...(this.game.getHomeworld(this.guildId)
          ?.location ||
          c.randomFromArray(
            this.game.planets.filter((p) => !p.homeworld),
          ).location),
      ].map(
        (pos) =>
          pos +
          c.randomBetween(
            this.game.settings.arrivalThreshold * -0.4,
            this.game.settings.arrivalThreshold * 0.4,
          ),
      ) as CoordinatePair,
    )

    await db.ship.addOrUpdateInDb(this)
  }

  canAttack(
    this: CombatShip,
    otherShip: Ship,
    ignoreWeaponState = false,
  ): boolean {
    if (this.game.tickCount < 10) return false
    // self
    if (this === otherShip) return false
    // not attackable
    if (!otherShip.attackable) return false
    // can't see it
    if (
      !(this.visible.ships as any).find(
        (s) => s.id === otherShip.id,
      )
    )
      return false
    // either is at pacifist planet
    if (
      (otherShip.planet && otherShip.planet.pacifist) ||
      (this.planet && this.planet.pacifist)
    )
      return false
    // dead
    if (otherShip.dead || this.dead) return false
    // same guild
    if (
      otherShip.guildId &&
      otherShip.guildId === this.guildId
    )
      return false
    // too far, or not in sight range
    if (
      c.distance(otherShip.location, this.location) >
      Math.min(this.radii.attack, this.radii.sight)
    )
      return false
    // no weapons available
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
    targetType: ItemType | `any` = `any`,
  ): TakenDamageResult {
    if (!this.canAttack(target))
      return {
        damageTaken: 0,
        didDie: false,
        weapon,
        miss: true,
      }

    weapon.use(1, this.membersIn(`weapons`))

    const totalMunitionsSkill = this.cumulativeSkillIn(
      `weapons`,
      `munitions`,
    )
    const range = c.distance(this.location, target.location)
    const distanceAsPercent = range / weapon.effectiveRange // 1 = far away, 0 = close
    const minHitChance = 0.08
    // 1.0 agility is "normal", higher is better
    const enemyAgility =
      target.chassis.agility +
      (target.passives.find(
        (p) => p.id === `boostChassisAgility`,
      )?.intensity || 0)

    const hitRoll = Math.random()
    const toHit =
      c.lerp(minHitChance, 1, distanceAsPercent) *
      enemyAgility *
      c.lerp(0.6, 1.4, Math.random()) // add in randomness so chassis+distance can't make it completely impossible to ever hit

    let miss = hitRoll < toHit

    const didCrit = miss
      ? false
      : Math.random() <=
        (weapon.critChance === undefined
          ? this.game.settings.baseCritChance
          : weapon.critChance)

    let damage = miss
      ? 0
      : c.getHitDamage(weapon, totalMunitionsSkill) *
        (didCrit
          ? this.game.settings.baseCritDamageMultiplier
          : 1)

    if (!miss) {
      // ----- apply passives -----
      const guildMembersWithinDistancePassives =
        this.passives.filter(
          (p) =>
            p.id ===
            `boostDamageWithNumberOfGuildMembersWithinDistance`,
        ) || []

      if (guildMembersWithinDistancePassives.length) {
        let damageMultiplier = 1

        guildMembersWithinDistancePassives.forEach((p) => {
          let guildMembersInRange = 0
          const range = p.data?.distance || 0

          this.visible.ships.forEach((s: any) => {
            if (
              s?.guildId &&
              s?.guildId === this.guildId &&
              c.distance(s.location, this.location) <= range
            )
              guildMembersInRange++
          })

          c.log(
            `damage boosted by`,
            (p.intensity || 0) * guildMembersInRange,
            `because there are`,
            guildMembersInRange,
            `guild members within`,
            range,
          )

          damageMultiplier +=
            (p.intensity || 0) * guildMembersInRange
        })

        damage *= damageMultiplier
      }

      const soloPassives =
        this.passives.filter(
          (p) =>
            p.id ===
            `boostDamageWhenNoAlliesWithinDistance`,
        ) || []

      if (soloPassives.length) {
        let damageMultiplier = 1

        soloPassives.forEach((p) => {
          let guildMembersInRange = 0
          const range = p.data?.distance || 0

          this.visible.ships.forEach((s: any) => {
            if (
              s?.guildId &&
              s?.guildId === this.guildId &&
              c.distance(s.location, this.location) <= range
            )
              guildMembersInRange++
          })

          if (!guildMembersInRange)
            damageMultiplier += p.intensity || 0
        })

        if (damageMultiplier > 1)
          c.log(
            `damage multiplied by`,
            damageMultiplier,
            `because there are no guild members within`,
            range,
          )
        damage *= damageMultiplier
      }

      const boostDamagePassiveMultiplier =
        this.getPassiveIntensity(`boostDamage`) + 1
      if (boostDamagePassiveMultiplier > 1)
        c.log(
          `damage multiplied by`,
          boostDamagePassiveMultiplier,
          `because of damage boost passive(s)`,
        )
      damage *= boostDamagePassiveMultiplier

      // ----- done with passives -----
    }

    // * using weapon repair level only for damage rolls. hit rolls are unaffected to keep the excitement alive, know what I mean?
    if (damage === 0) miss = true

    c.log(
      `gray`,
      `need to beat ${toHit}, rolled ${hitRoll} for a ${
        miss
          ? `miss`
          : `${
              didCrit ? `crit` : `hit`
            } of damage ${damage}`
      }`,
    )
    const damageResult: AttackDamageResult = {
      miss,
      damage,
      weapon,
      targetType: targetType || `any`,
      didCrit,
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
            color:
              target.guildId &&
              c.guilds[target.guildId].color,
            tooltipData: target.toReference() as any,
          },
          `with`,
          {
            text: weapon.displayName,
            color: `var(--item)`,
            tooltipData: {
              ...(weapon.toReference() as any),
              cooldownRemaining: undefined,
            },
          },
          `&nospace.`,
        ],
        `low`,
      )
    else
      this.logEntry(
        [
          `Attacked`,
          {
            text: target.name,
            color:
              target.guildId &&
              c.guilds[target.guildId].color,
            tooltipData: target.toReference() as any,
          },
          `with`,
          {
            text: weapon.displayName,
            color: `var(--item)`,
            tooltipData: {
              ...(weapon.toReference() as any),
            },
          },
          `&nospace, dealing`,
          {
            text:
              c.r2(c.r2(attackResult.damageTaken)) +
              ` damage`,
            color: `var(--success)`,
            tooltipData: {
              type: `damage`,
              ...attackResult,
            },
          },
          `&nospace${didCrit ? ` in a critical hit` : ``}.`,
          attackResult.didDie
            ? `${target.name} died in the exchange.`
            : ``,
        ],
        `high`,
      )

    this.addStat(`damageDealt`, attackResult.damageTaken)

    // extra combat xp on attack for all crew members in the weapons bay
    const xpBoostMultiplier =
      this.passives
        .filter((p) => p.id === `boostXpGain`)
        .reduce(
          (total, p) => (p.intensity || 0) + total,
          0,
        ) + 1
    this.crewMembers
      .filter((cm) => cm.location === `weapons`)
      .forEach((cm: CrewMember) => {
        cm.addXp(
          `munitions`,
          this.game.settings.baseXpGain *
            Math.round(weapon.damage * 40) *
            xpBoostMultiplier,
        )
      })

    if (attackResult.didDie) {
      // extra combat xp on kill for all crew members in the weapons bay
      this.crewMembers
        .filter((cm) => cm.location === `weapons`)
        .forEach((cm: CrewMember) => {
          cm.addXp(
            `munitions`,
            this.game.settings.baseXpGain *
              3000 *
              xpBoostMultiplier,
          )
        })

      this.addStat(`kills`, 1)
      if (this.human)
        (this as HumanShip).checkAchievements(`combat`)
    }

    return attackResult
  }

  takeDamage(
    this: CombatShip,
    attacker: { name: string; [key: string]: any },
    attack: AttackDamageResult,
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
      if (
        !itemTypeDamageMultipliers[p.data?.type as ItemType]
      )
        itemTypeDamageMultipliers[
          p.data?.type as ItemType
        ] = 1 + (p.intensity || 0)
      else
        itemTypeDamageMultipliers[
          p.data?.type as ItemType
        ]! += p.intensity || 0
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
                tooltipData: armor.toReference() as any,
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
                  color:
                    this.guildId &&
                    c.guilds[this.guildId].color,
                  tooltipData: this.toReference() as any,
                },
                `&nospace's`,
                {
                  text: armor.displayName,
                  color: `var(--item)`,
                  tooltipData: {
                    type: `armor`,
                    description: armor.description,
                    displayName: armor.displayName,
                    id: armor.id,
                  },
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
          `gray`,
          `hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage (${remainingHp} hp remaining)`,
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
          `gray`,
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
        // timeout so the hit message comes first
        setTimeout(() => {
          this.logEntry(
            [
              `Your`,
              {
                text: equipmentToAttack.displayName,
                color: `var(--item)`,
                tooltipData:
                  equipmentToAttack.toReference() as any,
              },
              `has been disabled!`,
            ],
            `high`,
          )
          if (`logEntry` in attacker && !didDie)
            attacker.logEntry(
              [
                `You have disabled`,
                {
                  text: this.name,
                  color:
                    this.guildId &&
                    c.guilds[this.guildId].color,
                  tooltipData: this.toReference() as any,
                },
                `&nospace's`,
                {
                  text: equipmentToAttack.displayName,
                  color: `var(--item)`,
                  tooltipData: {
                    displayName:
                      equipmentToAttack.displayName,
                    description:
                      equipmentToAttack.description,
                    type: equipmentToAttack.type,
                  },
                },
                `&nospace!`,
              ],
              `high`,
            )
        }, 100)
        equipmentToAttack.announceWhenBroken = false
      }
    }
    this.toUpdate.items = this.items.map((i) => i.stubify())

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
      weapon: attack.weapon?.toReference(),
      damageTally,
    }

    // ship damage
    if (attack.weapon)
      this.logEntry(
        [
          attack.miss
            ? `Missed by an attack from`
            : `${
                attack.didCrit
                  ? `Critical hit`
                  : `Hit by an attack`
              } from`,
          {
            text: attacker.name,
            color:
              attacker.guildId &&
              c.guilds[attacker.guildId].color,
            tooltipData: attacker?.toReference() as any,
          },
          `&nospace's`,
          {
            text: attack.weapon.displayName,
            color: `var(--item)`,
            tooltipData: attack.weapon.toReference(),
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
                    ...{
                      ...damageResult,
                      weapon: undefined,
                    },
                  },
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss ? `low` : `high`,
      )
    // zone or passive damage
    else
      this.logEntry(
        [
          attack.miss
            ? `Missed by`
            : `${
                attack.didCrit ? `Critical hit` : `Hit`
              } by`,
          {
            text: attacker.name,
            color: attacker.color || `var(--warning)`,
            tooltipData: attacker.toReference
              ? attacker.toReference()
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
                    ...{
                      ...damageResult,
                      weapon: undefined,
                    },
                  },
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss ? `low` : `high`,
      )

    return damageResult
  }

  die(attacker?: CombatShip) {
    this.addStat(`deaths`, 1)
    this.dead = true
  }

  repair(
    baseRepairAmount: number,
    repairPriority: RepairPriority = `most damaged`,
  ): { totalRepaired: number; overRepair: boolean } {
    let totalRepaired = 0
    const repairableItems = this.items.filter(
      (i) => i.repair <= 0.9995,
    )
    if (!repairableItems.length)
      return { totalRepaired, overRepair: false }
    const itemsToRepair: Item[] = []

    if (repairPriority === `engines`) {
      const r = repairableItems.filter(
        (i) => i.type === `engine`,
      )
      itemsToRepair.push(...r)
    } else if (repairPriority === `weapons`) {
      const r = repairableItems.filter(
        (i) => i.type === `weapon`,
      )
      itemsToRepair.push(...r)
    } else if (repairPriority === `scanners`) {
      const r = repairableItems.filter(
        (i) => i.type === `scanner`,
      )
      itemsToRepair.push(...r)
    } else if (repairPriority === `communicators`) {
      const r = repairableItems.filter(
        (i) => i.type === `communicator`,
      )
      itemsToRepair.push(...r)
    }
    if (
      itemsToRepair.length === 0 ||
      repairPriority === `most damaged`
    )
      itemsToRepair.push(
        repairableItems.reduce(
          (mostBroken, ri) =>
            ri.repair < mostBroken.repair ? ri : mostBroken,
          repairableItems[0],
        ),
      )

    const repairBoost =
      (this.passives.find(
        (p) => p.id === `boostRepairSpeed`,
      )?.intensity || 0) + 1

    const amountToRepair =
      (baseRepairAmount * repairBoost) /
      itemsToRepair.length

    // c.log(
    //   repairPriority,
    //   amountToRepair,
    //   itemsToRepair.map((i) => i.type),
    // )
    let overRepair = false
    itemsToRepair.forEach((ri) => {
      const previousRepair = ri.repair
      const res = ri.applyRepair(amountToRepair)
      overRepair = overRepair || res
      totalRepaired += ri.repair - previousRepair
    })

    this.updateThingsThatCouldChangeOnItemChange()
    return { totalRepaired, overRepair }
  }
}
