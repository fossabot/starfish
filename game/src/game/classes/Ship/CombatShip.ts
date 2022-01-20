import c from '../../../../../common/dist'

import { Ship } from './Ship'
import type { Weapon } from './Item/Weapon'
import type { Item } from './Item/Item'
import type { Engine } from './Item/Engine'
import type { Game } from '../../Game'
import type { CrewMember } from '../CrewMember/CrewMember'
import type { HumanShip } from './HumanShip/HumanShip'
import type { AIShip } from './AIShip/AIShip'
import type { FriendlyAIShip } from './AIShip/Friendly/FriendlyAIShip'
import type { EnemyAIShip } from './AIShip/Enemy/EnemyAIShip'

export abstract class CombatShip extends Ship {
  static percentOfCurrencyKeptOnDeath = 0.5
  static percentOfCurrencyDroppedOnDeath = 0.5

  targetShip: CombatShip | null = null
  targetItemType: ItemType | `any` = `any`
  combatTactic: CombatTactic = `defensive`
  attackable = true

  constructor(props: BaseShipData = {} as BaseShipData, game?: Game) {
    super(props, game)

    this.updateAttackRadius()
  }

  recalculateAll() {
    super.recalculateAll()
    this.updateAttackRadius()
  }

  updateAttackRadius() {
    this.radii.attack = Array.from(
      new Set(this.weapons.map((curr): number => curr.effectiveRange)),
    ).sort((a, b) => b - a) // biggest first
    this.toUpdate.radii = this.radii
  }

  applyPassive(p: ShipPassiveEffect) {
    this.passives.push(p)
    this.recalculateAll()
    this.toUpdate.passives = this.passives
  }

  applyTimedPassive(p: ShipPassiveEffect & { until: number }) {
    // this just saves it in the db; it has no effect until the game is restarted and timed passives are loaded
    this.timedPassives.push(p)

    this.passives.push(p)
    this.toUpdate.passives = this.passives
    this.recalculateAll()
  }

  removePassive(p: ShipPassiveEffect) {
    let index
    if (this.timedPassives.indexOf(p) !== -1)
      this.timedPassives.splice(this.timedPassives.indexOf(p), 1)
    while (index !== -1) {
      index = this.passives.findIndex((p2) => {
        for (let key in p)
          if (typeof p[key] !== `object` && p2[key] !== p[key]) return false

        if (typeof p.data?.source === `string`)
          return p.data.source === p2.data?.source

        for (let prop of Object.keys(p.data?.source || {}))
          if (typeof p.data?.source?.[prop] === `string`)
            if (p2.data?.source?.[prop] !== p.data?.source?.[prop]) return false
            else if (typeof p.data?.source?.[prop] === `object`)
              for (let prop2 of Object.keys(p.data?.source[prop] || {}))
                if (
                  p2.data?.source?.[prop]?.[prop2] !==
                  p.data?.source?.[prop]?.[prop2]
                )
                  return false

        return true
      })
      if (index === -1) return
      this.passives.splice(index, 1)
      this.recalculateAll()
      this.toUpdate.passives = this.passives
    }
  }

  checkExpiredPassives() {
    this.passives.forEach((p) => {
      if (!p.until) return
      if (p.until < Date.now()) this.removePassive(p)
    })
  }

  applyZoneTickEffects() {
    ;(
      (this.seenLandmarks?.length
        ? this.seenLandmarks?.filter((z) => z.type === `zone`)
        : this.visible.zones) || this.visible.zones
    )
      .filter((z) => c.pointIsInsideCircle(z.location, this.location, z.radius))
      .forEach((z) => z.affectShip(this))
  }

  availableWeapons(): Weapon[] {
    return this.weapons.filter((w) => w.cooldownRemaining <= 0)
  }

  getEnemiesInAttackRange(): CombatShip[] {
    const combatShipsInRange = (this.visible.ships as ShipStub[])
      .map((s) => this.game?.ships.find((ship) => ship.id === s.id))
      .filter(
        (s) =>
          s && (!this.onlyVisibleToShipId || s.id === this.onlyVisibleToShipId),
      )
      .filter((s) => s && this.canAttack(s, true))
      .sort(
        (a, b) =>
          c.distance(a!.location, this.location) -
          c.distance(b!.location, this.location),
      ) as CombatShip[]
    return combatShipsInRange
  }

  determineTargetShip(): CombatShip | null {
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) {
      this.targetShip = null
      return this.targetShip
    }

    this.targetShip = c.randomFromArray(enemies) as CombatShip

    return this.targetShip
  }

  async respawn() {
    c.log(`Respawning`, this.name)
    this.spawnedAt = Date.now()
    this.passives = []
    this.items = []
    this.previousLocations = []
    this.recalculateMaxHp()
    this.hp = this.maxHp
    this.dead = false
    this.move(
      [
        ...(this.game?.getHomeworld(this.guildId)?.location ||
          c.randomFromArray(
            this.game?.planets.filter(
              (p) =>
                !p.homeworld &&
                p.pacifist &&
                c.distance([0, 0], p.location) <
                  (this.game?.settings.safeZoneRadius ||
                    c.defaultGameSettings.safeZoneRadius),
            ) || [],
          )?.location || [0, 0]),
      ].map(
        (pos) =>
          pos +
          c.randomBetween(
            (this.game?.settings.arrivalThreshold ||
              c.defaultGameSettings.arrivalThreshold) * -0.4,
            (this.game?.settings.arrivalThreshold ||
              c.defaultGameSettings.arrivalThreshold) * 0.4,
          ),
      ) as CoordinatePair,
    )

    await this.game?.db?.ship.addOrUpdateInDb(this)
  }

  canAttack(
    this: CombatShip,
    otherShip: Ship,
    ignoreWeaponState = false,
  ): boolean {
    // self
    if (this === otherShip) return false
    // nonexistant
    if (!otherShip) return false
    // not attackable
    if (!otherShip.attackable) return false
    // can't see it
    if (!(this.visible.ships as any).find((s) => s.id === otherShip.id))
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
    if (otherShip.guildId && otherShip.guildId === this.guildId) return false
    // friendly ai ships
    if ((otherShip as AIShip).neverAttackIds?.includes(this.id)) return false
    // human ships within protected zone
    if (
      this.human &&
      otherShip.human &&
      (c.distance([0, 0], otherShip.location) <
        (this.game?.settings.safeZoneRadius || Infinity) ||
        c.distance([0, 0], this.location) <
          (this.game?.settings.safeZoneRadius || Infinity))
    )
      return false
    // too far, or not in sight range
    if (
      c.distance(otherShip.location, this.location) >
      Math.min(Math.max(...this.radii.attack) ?? Infinity, this.radii.sight)
    )
      return false
    // no weapons available
    if (!ignoreWeaponState && !this.availableWeapons().length) return false
    return true
  }

  attack(
    this: CombatShip,
    target: CombatShip,
    weapon:
      | Weapon
      | {
          displayName: string
          damage: number
          slowingFactor?: number
          repair?: number
        },
    targetType: ItemType | `any` = `any`,
    predeterminedHitChance?: number,
    attackRegardlessOfAttackability = false,
  ): TakenDamageResult {
    if (!attackRegardlessOfAttackability && !this.canAttack(target))
      return {
        damageTaken: 0,
        didDie: false,
        weapon,
        miss: true,
      }

    const totalMunitionsSkill = this.cumulativeSkillIn(`weapons`, `strength`)
    let miss: boolean,
      toHit: number,
      hitRoll: number = Math.random()
    if (predeterminedHitChance === undefined) {
      const passiveMultiplier = this.getPassiveIntensity(`boostAccuracy`) + 1
      hitRoll *= passiveMultiplier

      const range = c.distance(this.location, target.location)
      const distanceAsPercent =
        range / (`effectiveRange` in weapon ? weapon.effectiveRange : 10000) // 1 = far away, 0 = close
      const minHitChance = 0.08
      // 1.0 agility is "normal", higher is better
      const enemyAgility =
        target.chassis.agility +
        (target.passives.find((p) => p.id === `boostChassisAgility`)
          ?.intensity || 0)

      toHit =
        c.lerp(minHitChance, 1, distanceAsPercent) *
        enemyAgility *
        c.lerp(0.6, 1.4, Math.random()) // add in randomness so chassis+distance can't make it completely impossible to ever hit

      miss = hitRoll < toHit
    } else {
      toHit = 1 - predeterminedHitChance
      miss = hitRoll < toHit
    }

    const didCrit = miss
      ? false
      : Math.random() <=
        (`critChance` in weapon
          ? weapon.critChance
          : this.game?.settings.baseCritChance ||
            c.defaultGameSettings.baseCritChance)

    let damage = miss
      ? 0
      : c.getHitDamage(weapon, totalMunitionsSkill) *
        (didCrit
          ? this.game?.settings.baseCritDamageMultiplier ||
            c.defaultGameSettings.baseCritDamageMultiplier
          : 1)

    if (!miss) {
      // ----- apply passives -----
      const guildMembersWithinDistancePassives =
        this.passives.filter(
          (p) => p.id === `boostDamageWithNumberOfGuildMembersWithinDistance`,
        ) || []

      if (guildMembersWithinDistancePassives.length) {
        let damageMultiplier = 1

        guildMembersWithinDistancePassives.forEach((p) => {
          let guildMembersInRange = 0
          const passiveRange = p.data?.distance || 0

          this.visible.ships.forEach((s: any) => {
            if (
              s?.guildId &&
              s?.guildId === this.guildId &&
              c.distance(s.location, this.location) <= passiveRange
            )
              guildMembersInRange++
          })

          // c.log(
          //   `damage boosted by`,
          //   (p.intensity || 0) * guildMembersInRange,
          //   `because there are`,
          //   guildMembersInRange,
          //   `guild members within`,
          //   passiveRange,
          //   this.name,
          //   guildMembersWithinDistancePassives,
          // )

          damageMultiplier += (p.intensity || 0) * guildMembersInRange
        })

        damage *= damageMultiplier
      }

      const soloPassives =
        this.passives.filter(
          (p) => p.id === `boostDamageWhenNoAlliesWithinDistance`,
        ) || []

      if (soloPassives.length) {
        let damageMultiplier = 1

        soloPassives.forEach((p) => {
          let guildMembersInRange = 0
          const passiveRange = p.data?.distance || 0

          this.visible.ships.forEach((s: any) => {
            if (
              s?.guildId &&
              s?.guildId === this.guildId &&
              c.distance(s.location, this.location) <= passiveRange
            )
              guildMembersInRange++
          })

          if (!guildMembersInRange) {
            // c.log(
            //   `damage boosted by`,
            //   p.intensity || 0,
            //   `because there are no guild members within passive range`,
            //   passiveRange,
            //   this.name,
            //   soloPassives,
            // )
            damageMultiplier += p.intensity || 0
          }
        })

        damage *= damageMultiplier
      }

      const boostDamagePassiveMultiplier =
        this.getPassiveIntensity(`boostDamage`) + 1
      // if (boostDamagePassiveMultiplier > 1)
      //   c.log(
      //     `damage multiplied by`,
      //     boostDamagePassiveMultiplier,
      //     `because of damage boost passive(s)`,
      //     this.name,
      //     this.passives,
      //   )
      damage *= boostDamagePassiveMultiplier

      // ----- done with passives -----
    }

    // * using weapon repair level only for damage rolls. hit rolls are unaffected to keep the excitement alive, know what I mean?
    if (damage === 0) miss = true

    // c.log(
    //   `gray`,
    //   `need to beat ${toHit}, rolled ${hitRoll} for a ${
    //     miss
    //       ? `miss`
    //       : `${
    //           didCrit ? `crit` : `hit`
    //         } of damage ${damage}`
    //   }`,
    // )
    const damageResult: AttackDamageResult = {
      miss,
      damage,
      weapon,
      targetType: targetType || `any`,
      didCrit,
    }
    const attackResult = target.takeDamage(this, damageResult)

    this.game?.addAttackRemnant({
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

    if (`use` in weapon)
      this.crewMembers.forEach((cm) => cm.changeMorale(miss ? 0.001 : 0.03))

    const slowingFactor =
      this.getPassiveIntensity(`attacksSlow`) +
      (weapon.slowingFactor || 0) * (weapon.repair ?? 1)

    if (attackResult.miss)
      this.logEntry(
        [
          `Missed`,
          {
            text:
              ((target as EnemyAIShip).speciesId
                ? c.species[(target as EnemyAIShip).speciesId]?.icon || ``
                : ``) + target.name,
            color: target.guildId && c.guilds[target.guildId].color,
            tooltipData: target.toReference() as any,
          },
          // `with`,
          // {
          //   text: weapon.displayName,
          //   color: `var(--item)`,
          //   tooltipData: {
          //     ...(weapon.toReference() as any),
          //     cooldownRemaining: undefined,
          //   },
          // },
          `&nospace.`,
        ],
        `low`,
        `outgoingAttackMiss`,
      )
    else {
      this.logEntry(
        [
          `Hit`,
          {
            text:
              ((target as EnemyAIShip).speciesId
                ? c.species[(target as EnemyAIShip).speciesId]?.icon || ``
                : ``) + target.name,
            color: target.guildId && c.guilds[target.guildId].color,
            tooltipData: target.toReference() as any,
          },
          // `with`,
          // {
          //   text: weapon.displayName,
          //   color: `var(--item)`,
          //   tooltipData: {
          //     ...(weapon.toReference() as any),
          //   },
          // },
          `for`,
          {
            text:
              c.numberWithCommas(
                c.r2(attackResult.damageTaken * c.displayHPMultiplier, 0),
              ) + ` dmg`,
            color: `var(--success)`,
            tooltipData: {
              type: `damage`,
              ...attackResult,
              slowedBy: slowingFactor,
              overkill: attackResult.didDie
                ? damage - attackResult.damageTaken
                : undefined,
            },
          },
          `&nospace${didCrit ? ` (Crit!)` : ``}.`,
        ],
        `high`,
        `outgoingAttackHit`,
        true,
      )
      if (attackResult.didDie) {
        this.crewMembers.forEach((cm) => cm.changeMorale(0.5))
        this.logEntry(
          [
            {
              text:
                ((target as EnemyAIShip).speciesId
                  ? c.species[(target as EnemyAIShip).speciesId]?.icon || ``
                  : ``) + target.name,
              color: target.guildId && c.guilds[target.guildId].color,
              tooltipData: target.toReference() as any,
            },
            `was destroyed!`,
          ],
          `critical`,
          `kill`,
          true,
        )
      }
    }

    this.addStat(`damageDealt`, attackResult.damageTaken)

    // extra combat xp on attack for all crew members in the weapons bay
    const xpBoostMultiplier =
      this.passives
        .filter((p) => p.id === `boostXpGain`)
        .reduce((total, p) => (p.intensity || 0) + total, 0) + 1
    this.crewMembers
      .filter((cm) => cm.location === `weapons`)
      .forEach((cm: CrewMember) => {
        cm.addXp(
          `strength`,
          (this.game?.settings.baseXpGain || c.defaultGameSettings.baseXpGain) *
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
            `strength`,
            (this.game?.settings.baseXpGain ||
              c.defaultGameSettings.baseXpGain) *
              3000 *
              xpBoostMultiplier,
          )
        })

      this.addStat(`kills`, 1)
      if (this.human) (this as HumanShip).checkAchievements(`combat`)
    }

    // use weapons at the end so we get at 1 shot on perfect repair
    if (`use` in weapon) weapon.use(1, this.membersIn(`weapons`))

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
          .reduce((total, p) => total + (p.intensity || 0), 0),
    )
    remainingDamage *= passiveDamageMultiplier

    // flat damage reduction
    const flatDamageReduction = this.passives
      .filter((p) => p.id === `flatDamageReduction`)
      .reduce((total, p) => total + (p.intensity || 0), 0)
    remainingDamage -= flatDamageReduction
    if (remainingDamage < 0) remainingDamage = 0

    const attackDamageAfterPassives = remainingDamage

    if (attack.didCrit) this.crewMembers.forEach((cm) => cm.changeMorale(0.03))

    // calculate passive item type damage boosts from attacker
    let itemTypeDamageMultipliers: {
      [key in ItemType]?: number
    } = {}
    ;(
      attacker.passives?.filter(
        (p: ShipPassiveEffect) => p.id === `boostDamageToItemType`,
      ) || []
    ).forEach((p: ShipPassiveEffect) => {
      if (!itemTypeDamageMultipliers[p.data?.type as ItemType])
        itemTypeDamageMultipliers[p.data?.type as ItemType] =
          1 + (p.intensity || 0)
      else
        itemTypeDamageMultipliers[p.data?.type as ItemType]! += p.intensity || 0
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
          adjustedRemainingDamage *= itemTypeDamageMultipliers.armor
        const { remaining, taken } = armor.blockDamage(adjustedRemainingDamage)
        totalDamageDealt += taken
        const damageRemovedFromTotal = adjustedRemainingDamage - remaining
        remainingDamage -= damageRemovedFromTotal

        if (armor.hp === 0 && this.crewMembers.length)
          this.crewMembers.forEach((cm) => cm.changeMorale(-0.04))

        if (armor.hp === 0 && armor.announceWhenBroken) {
          this.logEntry(
            [
              `Your`,
              {
                text: armor.displayName,
                color: `var(--item)`,
                tooltipData: armor.toReference() as any,
              },
              `was disabled!`,
            ],
            `high`,
            `incomingAttackDisable`,
          )
          if (`logEntry` in attacker)
            attacker.logEntry(
              [
                `Disabled`,
                {
                  text:
                    ((this as EnemyAIShip).speciesId
                      ? c.species[(this as EnemyAIShip).speciesId]?.icon || ``
                      : ``) + this.name,
                  color: this.guildId && c.guilds[this.guildId].color,
                  tooltipData: this.toReference() as any,
                },
                `&nospace's`,
                {
                  text: armor.displayName,
                  color: `var(--item)`,
                  tooltipData: {
                    type: `item`,
                    itemType: `armor`,
                    description: armor.description,
                    displayName: armor.displayName,
                    itemId: armor.itemId,
                  },
                },
                `&nospace!`,
              ],
              `high`,
              `outgoingAttackDisable`,
              true,
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
          (i) => i.repair > 0 && i.itemType === attack.targetType,
        )
      if (!attackableEquipment.length)
        attackableEquipment = this.items.filter((i) => i.repair > 0)
      // nothing to attack, so we're done
      if (!attackableEquipment.length) {
        remainingDamage = 0
        break
      }

      const equipmentToAttack: Item = c.randomFromArray(attackableEquipment)

      // apply passive damage boost to item types
      let adjustedRemainingDamage = remainingDamage
      if (itemTypeDamageMultipliers[equipmentToAttack.itemType] !== undefined) {
        adjustedRemainingDamage *=
          itemTypeDamageMultipliers[equipmentToAttack.itemType]!
        // c.log(
        //   `damage to`,
        //   equipmentToAttack.itemType,
        //   `boosted by passive:`,
        //   remainingDamage,
        //   `became`,
        //   adjustedRemainingDamage,
        // )
      }

      const remainingHp = equipmentToAttack.hp
      // ----- item not destroyed -----
      if (remainingHp >= adjustedRemainingDamage) {
        // c.log(
        //   `gray`,
        //   `hitting ${equipmentToAttack.displayName} with ${adjustedRemainingDamage} damage (${remainingHp} hp remaining)`,
        // )
        equipmentToAttack.hp -= adjustedRemainingDamage
        equipmentToAttack._stub = null
        remainingDamage = 0
        totalDamageDealt += adjustedRemainingDamage
        damageTally.push({
          targetType: equipmentToAttack.itemType,
          targetDisplayName: equipmentToAttack.displayName,
          damage: adjustedRemainingDamage,
          destroyed: false,
        })
      }
      // ----- item destroyed -----
      else {
        // c.log(
        //   `gray`,
        //   `destroying ${equipmentToAttack.displayName} with ${remainingHp} damage`,
        // )
        equipmentToAttack.hp = 0
        equipmentToAttack._stub = null
        remainingDamage -= remainingHp
        totalDamageDealt += remainingHp
        damageTally.push({
          targetType: equipmentToAttack.itemType,
          targetDisplayName: equipmentToAttack.displayName,
          damage: remainingHp,
          destroyed: true,
        })
      }

      if (equipmentToAttack.hp === 0 && this.crewMembers.length)
        this.crewMembers.forEach((cm) => cm.changeMorale(-0.04))
      // ----- notify both sides -----
      if (equipmentToAttack.hp === 0 && equipmentToAttack.announceWhenBroken) {
        // timeout so the hit message comes first
        setTimeout(() => {
          this.logEntry(
            [
              `Your`,
              {
                text: equipmentToAttack.displayName,
                color: `var(--item)`,
                tooltipData: equipmentToAttack.toReference() as any,
              },
              `was disabled!`,
            ],
            `high`,
            `incomingAttackDisable`,
          )
          if (
            `logEntry` in attacker &&
            !didDie &&
            // check to see if the attacker can actually see equipment repair
            (attacker as HumanShip).visible?.ships?.find(
              (s) => s.id === this.id,
            )?.items?.[0]?.repair
          )
            attacker.logEntry(
              [
                `Disabled`,
                {
                  text:
                    ((this as EnemyAIShip).speciesId
                      ? c.species[(this as EnemyAIShip).speciesId]?.icon || ``
                      : ``) + this.name,
                  color: this.guildId && c.guilds[this.guildId].color,
                  tooltipData: this.toReference() as any,
                },
                `&nospace's`,
                {
                  text: equipmentToAttack.displayName,
                  color: `var(--item)`,
                  tooltipData: {
                    displayName: equipmentToAttack.displayName,
                    description: equipmentToAttack.description,
                    type: `item`,
                    itemType: equipmentToAttack.itemType,
                    itemId: equipmentToAttack.itemId,
                  },
                },
                `&nospace!`,
              ],
              `high`,
              `outgoingAttackDisable`,
              true,
            )
        }, 100)
        equipmentToAttack.announceWhenBroken = false
      }
    }
    this.toUpdate.items = this.items.map((i) => i.stubify())

    // ----- slow down if weapon had slowing factor -----
    let slowedPercent = attacker.getPassiveIntensity?.(`attacksSlow`) || 0
    if (attack.weapon?.slowingFactor) {
      slowedPercent +=
        attack.weapon.slowingFactor * (attack.weapon?.repair ?? 1)
    }
    if (slowedPercent > 0) {
      this.velocity[0] *= 1 - slowedPercent
      this.velocity[1] *= 1 - slowedPercent
      this.toUpdate.velocity = this.velocity
      this.toUpdate.speed = c.vectorToMagnitude(this.velocity)
    }

    const didDie = previousHp > 0 && this.hp <= 0
    if (didDie) this.die(attacker instanceof CombatShip ? attacker : undefined)

    this.addStat(`damageTaken`, totalDamageDealt)

    c.log(
      `gray`,
      `💥 ${this.name} takes ${c.r2(
        totalDamageDealt * c.displayHPMultiplier,
      )} damage from ${attacker.name}'s ${
        attack.weapon ? attack.weapon.displayName : `passive effect`
      }, and ${
        didDie
          ? `dies ☠️`
          : `has ${c.r2(this.hp * c.displayHPMultiplier)} hp left`
      }.` + (slowedPercent ? ` Slowed by ${c.r2(slowedPercent * 100)}%` : ``),
    )

    this.toUpdate._hp = this.hp
    this.toUpdate.dead = this.dead

    const damageResult = {
      miss: attackDamageAfterPassives === 0,
      damageTaken: totalDamageDealt,
      damageMitigated: attack.damage - attackDamageAfterPassives,
      didDie: didDie,
      weapon: attack.weapon?.toReference?.() || attack.weapon,
      damageTally,
    }

    // ship damage
    if (attack.weapon)
      this.logEntry(
        [
          attack.miss ? `Missed by` : attack.didCrit ? `Crit by` : `Hit by`,
          {
            text:
              ((attacker as EnemyAIShip).speciesId
                ? c.species[(attacker as EnemyAIShip).speciesId]?.icon || ``
                : ``) + attacker.name,
            color: attacker.guildId && c.guilds[attacker.guildId].color,
            tooltipData: attacker?.toReference() as any,
          },
          // `&nospace's`,
          // {
          //   text: attack.weapon.displayName,
          //   color: `var(--item)`,
          //   tooltipData: attack.weapon.toReference(),
          // },

          ...(attack.miss
            ? [`&nospace.`]
            : ([
                `for`,
                {
                  text: `${c.numberWithCommas(
                    c.r2(totalDamageDealt * c.displayHPMultiplier, 0),
                  )} dmg`,
                  color: `var(--warning)`,
                  tooltipData: {
                    type: `damage`,
                    ...{
                      ...damageResult,
                      hpLeft: c.r2(this._hp, 0),
                      slowedBy: slowedPercent,
                      weapon: undefined,
                    },
                  },
                },
                {
                  discordOnly: true,
                  text: `(${c.numberWithCommas(
                    c.r2(this._hp * c.displayHPMultiplier, 0),
                  )} HP left)`,
                  color: `rgba(255,255,255,.5)`,
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss || !totalDamageDealt ? `low` : `high`,
        attack.miss
          ? `incomingAttackMiss`
          : attack.didCrit
          ? `incomingAttackCrit`
          : `incomingAttackHit`,
      )
    // zone or passive damage
    else
      this.logEntry(
        [
          attack.miss ? `Missed by` : attack.didCrit ? `Crit by` : `Hit by`,
          {
            text:
              ((attacker as EnemyAIShip).speciesId
                ? c.species[(attacker as EnemyAIShip).speciesId]?.icon || ``
                : ``) + attacker.name,
            color: attacker.color || `var(--warning)`,
            tooltipData: attacker?.toReference
              ? attacker.toReference()
              : undefined,
          },
          ...(attack.miss
            ? [`&nospace.`]
            : ([
                `for`,
                {
                  text: `${c.numberWithCommas(
                    c.r2(totalDamageDealt * c.displayHPMultiplier, 0),
                  )} dmg`,
                  color: `var(--warning)`,
                  tooltipData: {
                    type: `damage`,
                    ...{
                      ...damageResult,
                      hpLeft: c.r2(this._hp, 0),
                      slowedBy: slowedPercent,
                      weapon: undefined,
                    },
                  },
                },
                {
                  discordOnly: true,
                  text: `(${c.numberWithCommas(
                    c.r2(this._hp * c.displayHPMultiplier, 0),
                  )} HP left)`,
                  color: `rgba(255,255,255,.5)`,
                },
                `&nospace.`,
              ] as RichLogContentElement[])),
        ],
        attack.miss || !totalDamageDealt ? `low` : `high`,
        attack.miss
          ? `incomingAttackMiss`
          : attack.didCrit
          ? `incomingAttackCrit`
          : `incomingAttackHit`,
      )

    return damageResult
  }

  die(attacker?: CombatShip) {
    this.addStat(`deaths`, 1)
    this.dead = true
    this.game?.ships
      .filter((s) => (s as CombatShip).targetShip === this)
      .forEach((s) => {
        ;(s as CombatShip).determineTargetShip()
      })
    this.game?.humanShips
      .filter((s) =>
        (s as HumanShip).contracts.find((co) => co.targetId === this.id),
      )
      .forEach((s) => {
        const contract = (s as HumanShip).contracts.find(
          (co) => co.targetId === this.id,
        )
        if (!contract) return
        if (attacker?.id === s.id) s.completeContract(contract)
        else s.stolenContract(contract)
      })
    this.game?.basicPlanets.forEach((p) => {
      const contractIndex = p.contracts.findIndex(
        (co) => co.targetId === this.id,
      )
      if (contractIndex !== -1) p.contracts.splice(contractIndex, 1)
    })
  }

  repair(
    baseRepairAmount: number,
    repairPriority: RepairPriority = `most damaged`,
  ): { totalRepaired: number; overRepair: boolean } {
    let totalRepaired = 0
    const repairableItems = this.items.filter((i) => i.repair <= 0.9995)
    if (!repairableItems.length) return { totalRepaired, overRepair: false }
    const itemsToRepair: Item[] = []

    if (repairPriority === `engines`) {
      const r = repairableItems.filter((i) => i.itemType === `engine`)
      itemsToRepair.push(...r)
    } else if (repairPriority === `weapons`) {
      const r = repairableItems.filter((i) => i.itemType === `weapon`)
      itemsToRepair.push(...r)
    } else if (repairPriority === `scanners`) {
      const r = repairableItems.filter((i) => i.itemType === `scanner`)
      itemsToRepair.push(...r)
    } else if (repairPriority === `communicators`) {
      const r = repairableItems.filter((i) => i.itemType === `communicator`)
      itemsToRepair.push(...r)
    }
    if (itemsToRepair.length === 0 || repairPriority === `most damaged`)
      itemsToRepair.push(
        repairableItems.reduce(
          (mostBroken, ri) => (ri.repair < mostBroken.repair ? ri : mostBroken),
          repairableItems[0],
        ),
      )

    const repairBoost =
      (this.passives.find((p) => p.id === `boostRepairSpeed`)?.intensity || 0) +
      1

    const amountToRepair =
      (baseRepairAmount * repairBoost) / itemsToRepair.length

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

    this.recalculateAll()
    return { totalRepaired, overRepair }
  }
}
