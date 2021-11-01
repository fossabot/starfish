import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
import type { CombatShip } from '../Ship/CombatShip'
import { Planet } from './Planet'

type AddableElement =
  | { class: `cargo`; id: CargoId; propensity: number }
  | {
      class: `items`
      type: ItemType
      id: ItemId
      propensity: number
    }
  | {
      class: `crewPassives`
      id: CrewPassiveId
      propensity: number
      intensity: number
    }
  | { class: `chassis`; id: ChassisId; propensity: number }
  | { class: `repair`; propensity: number }
  | { class: `tagline`; value: string; propensity: number }
  | {
      class: `headerBackground`
      value: HeaderBackground
      propensity: number
    }

export class BasicPlanet extends Planet {
  static readonly priceFluctuatorIntensity = 0.8

  readonly allegiances: PlanetAllegianceData[]
  readonly leanings: PlanetLeaning[]

  vendor: PlanetVendor
  bank: boolean = false
  defense: number = 0

  priceFluctuator = 1

  toUpdate: {
    vendor?: PlanetVendor
    allegiances?: PlanetAllegianceData[]
    priceFluctuator?: number
    landingRadiusMultiplier?: number
    passives?: ShipPassiveEffect[]
  } = {}

  constructor(data: BaseBasicPlanetData, game?: Game) {
    super(data, game)
    this.planetType = `basic`

    this.guildId = data.guildId ? data.guildId : undefined
    this.homeworld = this.guildId
    if (this.guildId)
      this.color = c.guilds[this.guildId].color

    this.leanings = data.leanings || []

    this.allegiances = []
    if (data.allegiances) {
      for (let a of data.allegiances) {
        if (c.guilds[a.guildId])
          this.allegiances.push({
            guildId: a.guildId,
            level: a.level,
          })
      }
      this.toUpdate.allegiances = this.allegiances
    }

    this.vendor = data.vendor
    this.bank = data.bank
    this.defense = data.defense

    // c.log(this.getAddableToVendor())
    // c.log(
    //   this.repairFactor,
    //   this.landingRadiusMultiplier,
    //   this.level,
    // )

    this.updateFluctuator()
    setInterval(
      () => this.updateFluctuator(),
      1000 * 60 * 60 * 24 * 0.1,
    ) // every day

    setInterval(
      () => this.decrementAllegiances(),
      1000 * 60 * 60 * 24 * 0.1,
    ) // every day

    if (this.guildId)
      this.incrementAllegiance(this.guildId, 100)

    if (this.homeworld)
      while (this.level < c.defaultHomeworldLevel)
        this.levelUp()
  }

  tick() {
    super.tick()
    this.defend()
  }

  levelUp() {
    super.levelUp()

    const shipPassiveLeaning = this.leanings.find(
      (l) => l.type === `shipPassives`,
    )
    const shipPassiveMultiplier = shipPassiveLeaning?.never
      ? 0
      : shipPassiveLeaning?.propensity || 1

    const defensePassiveLeaning = this.leanings.find(
      (l) => l.type === `defense`,
    )
    const defenseMultiplier = defensePassiveLeaning?.never
      ? 0
      : defensePassiveLeaning?.propensity || 1

    const levelUpOptions = [
      { weight: 200 / this.level, value: `addItemToShop` },
      {
        weight: 1,
        value: `expandLandingZone`,
      },
      {
        weight: 5,
        value: `increaseAutoRepair`,
      },
      {
        weight: 10 * defenseMultiplier,
        value: `boostDefense`,
      },
      {
        weight: 3 * shipPassiveMultiplier,
        value: `boostSightRange`,
      },
      {
        weight: 2 * shipPassiveMultiplier,
        value: `boostStaminaRegeneration`,
      },
      {
        weight: shipPassiveMultiplier * 1.01,
        value: `boostBroadcastRange`,
      },
      {
        weight: shipPassiveMultiplier * 1.01,
        value: `boostRepairSpeed`,
      },
      {
        weight: shipPassiveMultiplier * 1.01,
        value: `boostCockpitChargeSpeed`,
      },
    ]

    if (!this.bank)
      levelUpOptions.push({
        weight: 0.1 * this.level,
        value: `addBank`,
      })

    let levelUpEffect = c.randomWithWeights(levelUpOptions)

    // homeworlds always have repair factor to some degree
    if (this.level === 1 && this.homeworld)
      levelUpEffect = `increaseAutoRepair`

    if (levelUpEffect === `expandLandingZone`) {
      this.landingRadiusMultiplier *= 2
    }
    if (levelUpEffect === `boostDefense`) {
      this.defense += 1
    } else if (levelUpEffect === `increaseAutoRepair`) {
      this.addPassive({
        id: `autoRepair`,
        intensity: 0.4,
      })
    } else if (levelUpEffect === `boostSightRange`) {
      this.addPassive({
        id: `boostSightRange`,
        intensity: 0.1,
      })
    } else if (
      levelUpEffect === `boostStaminaRegeneration`
    ) {
      this.addPassive({
        id: `boostStaminaRegeneration`,
        intensity: 0.1,
      })
    } else if (levelUpEffect === `boostBroadcastRange`) {
      this.addPassive({
        id: `boostBroadcastRange`,
        intensity: 0.1,
      })
    } else if (levelUpEffect === `boostRepairSpeed`) {
      this.addPassive({
        id: `boostRepairSpeed`,
        intensity: 0.1,
      })
    } else if (
      levelUpEffect === `boostCockpitChargeSpeed`
    ) {
      this.addPassive({
        id: `boostCockpitChargeSpeed`,
        intensity: 0.1,
      })
    } else if (levelUpEffect === `addBank`) {
      this.bank = true
    } else if (levelUpEffect === `addItemToShop`) {
      if (this.vendor) {
        // add something to vendor
        const addable = this.getAddableToVendor()
        if (!addable.length) return
        const toAddToVendor = c.randomWithWeights(
          addable.map((a) => ({
            weight: a.propensity,
            value: a,
          })),
        )

        if (toAddToVendor.class === `repair`)
          this.vendor.repairCostMultiplier =
            getRepairCostMultiplier()
        else {
          const { buyMultiplier, sellMultiplier } =
            getBuyAndSellMultipliers()
          if (toAddToVendor.class === `items`)
            this.vendor.items.push({
              buyMultiplier,
              id: toAddToVendor.id,
              type: toAddToVendor.type,
            })

          if (toAddToVendor.class === `tagline`)
            this.vendor.shipCosmetics.push({
              tagline: toAddToVendor.value,
              priceMultiplier: buyMultiplier ** 2,
            })
          if (toAddToVendor.class === `headerBackground`)
            this.vendor.shipCosmetics.push({
              headerBackground: toAddToVendor.value,
              priceMultiplier: buyMultiplier ** 2,
            })

          if (toAddToVendor.class === `chassis`)
            this.vendor.chassis.push({
              buyMultiplier,
              id: toAddToVendor.id,
            })
          if (toAddToVendor.class === `crewPassives`)
            this.vendor.passives.push({
              buyMultiplier,
              id: toAddToVendor.id,
              intensity: toAddToVendor.intensity,
            })
          if (toAddToVendor.class === `cargo`)
            this.vendor.cargo.push({
              buyMultiplier,
              sellMultiplier,
              id: toAddToVendor.id,
            })
        }
      }
    }

    this.updateFrontendForShipsAt()
  }

  getAddableToVendor(): AddableElement[] {
    const targetRarity = Math.max(0, this.level - 2) / 3
    const rarityMultiplier = (rarity: number) =>
      1 / (Math.abs(rarity - targetRarity) + 1)
    const addable: AddableElement[] = []

    if (
      !this.leanings.find(
        (p) => p.type === `cargo` && p.never === true,
      )
    ) {
      const propensity =
        ((this.leanings.find((p) => p.type === `cargo`)
          ?.propensity || 1) /
          Object.keys(c.cargo).length) *
        3
      // * multiplied to make cargo slightly more common
      for (let cargo of Object.values(c.cargo))
        if (
          !this.vendor?.cargo.find(
            (ca) => ca.id === cargo.id,
          )
        )
          addable.push({
            class: `cargo`,
            id: cargo.id,
            propensity:
              propensity * rarityMultiplier(cargo.rarity),
          })
    }

    if (
      !this.leanings.find(
        (l) => l.type === `items` && l.never === true,
      )
    ) {
      const baseItemPropensity =
        (this.leanings.find((l) => l.type === `items`)
          ?.propensity || 1) * 2
      for (let itemGroup of Object.values(c.items)) {
        if (
          this.leanings.find(
            (p) =>
              p.type === Object.values(itemGroup)[0].type &&
              p.never === true,
          )
        )
          continue

        let propensity =
          baseItemPropensity *
          (this.leanings.find(
            (p) =>
              p.type === Object.values(itemGroup)[0].type,
          )?.propensity || 0.2)
        propensity /= Object.keys(itemGroup).length
        // * lightly encourage specialization
        const alreadySellingOfType =
          this.vendor?.items.filter(
            (i) =>
              i.type === Object.values(itemGroup)[0].type,
          ).length || 0
        propensity *= 2 + alreadySellingOfType

        for (let item of Object.values(itemGroup))
          if (
            item.buyable !== false &&
            !item.special &&
            !this.vendor?.items.find(
              (i) =>
                i.type === item.type && i.id === item.id,
            ) &&
            !this.vendor?.chassis.find(
              (i) =>
                item.type === `chassis` && i.id === item.id,
            )
          )
            addable.push({
              class:
                item.type === `chassis`
                  ? `chassis`
                  : `items`,
              type: item.type,
              id: item.id,
              propensity:
                propensity * rarityMultiplier(item.rarity),
            })
      }
    }

    if (
      !this.leanings.find(
        (p) =>
          p.type === `crewPassives` && p.never === true,
      )
    ) {
      const propensity =
        (this.leanings.find(
          (p) => p.type === `crewPassives`,
        )?.propensity || 1) /
        Object.keys(c.crewPassives).length
      for (let crewPassive of Object.values(c.crewPassives))
        if (
          crewPassive.buyable &&
          !this.vendor?.passives.find(
            (p) => p.id === crewPassive.id,
          )
        )
          addable.push({
            class: `crewPassives`,
            id: crewPassive.id,
            propensity:
              propensity *
              5 *
              rarityMultiplier(crewPassive.buyable.rarity),
            intensity: c.r2(
              c.crewPassives[crewPassive.id].buyable!
                .baseIntensity *
                Math.random() +
                0.5,
              c.crewPassives[crewPassive.id].buyable!
                .wholeNumbersOnly
                ? 0
                : 2,
            ),
          })
    }

    if (
      !this.leanings.find(
        (p) => p.type === `cosmetics` && p.never === true,
      )
    ) {
      const taglinePropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)
          ?.propensity || 1) / c.buyableTaglines.length
      for (let tagline of c.buyableTaglines)
        if (
          !this.vendor?.shipCosmetics.find(
            (p) => p.tagline === tagline.value,
          )
        )
          addable.push({
            class: `tagline`,
            value: tagline.value,
            propensity:
              taglinePropensity *
              rarityMultiplier(tagline.rarity),
          })

      const headerBackgroundPropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)
          ?.propensity || 1) / c.buyableTaglines.length
      for (let headerBackground of c.buyableHeaderBackgrounds)
        if (
          !this.vendor?.shipCosmetics.find(
            (p) =>
              p.headerBackground &&
              p.headerBackground?.url ===
                headerBackground.value.url,
          )
        )
          addable.push({
            class: `headerBackground`,
            value: headerBackground.value,
            propensity:
              headerBackgroundPropensity *
              rarityMultiplier(headerBackground.rarity),
          })
    }

    if (
      !this.leanings.find(
        (p) => p.type === `repair` && p.never === true,
      )
    ) {
      const propensity =
        this.leanings.find((p) => p.type === `repair`)
          ?.propensity || 0.1
      if (!this.vendor?.repairCostMultiplier)
        addable.push({ class: `repair`, propensity })
    }

    return addable
  }

  defend(force = false) {
    if (!this.defense) return
    if (!force && !c.lottery(this.defense, 1000)) return

    const attackRemnantsInSight =
      this.game?.scanCircle(
        this.location,
        c.getPlanetDefenseRadius(this.defense) * 1.5,
        null,
        [`attackRemnant`],
      )?.attackRemnants || []
    if (!attackRemnantsInSight.length) return

    const validTargetIds: string[] = Array.from(
      attackRemnantsInSight.reduce((ids, ar) => {
        if (ar.attacker?.id === this.id) return ids
        const bothHuman =
          !(ar.attacker as any)?.ai &&
          !(ar.defender as any)?.ai
        if (bothHuman) {
          ids.add(ar.attacker?.id)
          ids.add(ar.defender?.id)
        } else {
          if ((ar.attacker as any).ai)
            ids.add(ar.attacker?.id)
          else ids.add(ar.defender?.id)
        }
        return ids
      }, new Set()) as Set<string>,
    )
    if (!validTargetIds.length) return

    const shipsInSight =
      this.game?.scanCircle(
        this.location,
        c.getPlanetDefenseRadius(this.defense),
        null,
        [`aiShip`, `humanShip`],
      )?.ships || []

    const enemiesInRange: CombatShip[] =
      shipsInSight.filter(
        (s) =>
          validTargetIds.includes(s.id) &&
          s.attackable &&
          !this.allegiances.find(
            (a) =>
              a.level >= c.guildAllegianceFriendCutoff &&
              a.guildId === s.guildId,
          ),
      ) as CombatShip[]
    if (enemiesInRange.length === 0) return
    const target = c.randomFromArray(enemiesInRange)
    if (
      !target ||
      !target.attackable ||
      target.planet ||
      target.dead
    )
      return

    // ----- attack enemy -----

    const hitRoll = Math.random()
    const range = c.distance(this.location, target.location)
    const distanceAsPercent =
      range / c.getPlanetDefenseRadius(this.defense) // 1 = far away, 0 = close
    const minHitChance = 0.08
    // 1.0 agility is "normal", higher is better
    const enemyAgility =
      target.chassis.agility +
      (target.passives.find(
        (p) => p.id === `boostChassisAgility`,
      )?.intensity || 0)

    const toHit =
      c.lerp(minHitChance, 1, distanceAsPercent) *
      enemyAgility *
      c.lerp(0.6, 1.4, Math.random()) // add in randomness so chassis+distance can't make it completely impossible to ever hit
    let miss = hitRoll < toHit

    const didCrit = miss
      ? false
      : Math.random() <=
        (this.game?.settings.baseCritChance ||
          c.defaultGameSettings.baseCritChance)

    let damage = miss
      ? 0
      : c.getPlanetDefenseDamage(this.defense) *
        (didCrit
          ? this.game?.settings.baseCritDamageMultiplier ||
            c.defaultGameSettings.baseCritDamageMultiplier
          : 1)

    if (damage === 0) miss = true

    c.log(
      `gray`,
      `planet needs to beat ${toHit}, rolled ${hitRoll} for a ${
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
      targetType: `any`,
      didCrit,
      weapon: {
        toReference() {
          return {
            type: `weapon`,
            displayName: `Orbital Mortar`,
            description: `This satellite-mounted weapons system is highly advanced and able to track multiple targets at once. It does, however, lose line of sight periodically as it moves behind its planet.`,
          }
        },
        type: `weapon`,
        displayName: `Orbital Mortar`,
      },
    }
    const attackResult = target.takeDamage(
      this,
      damageResult,
    )

    this.game?.addAttackRemnant({
      attacker: this,
      defender: target,
      damageTaken: attackResult,
      start: [...this.location],
      end: [...target.location],
      time: Date.now(),
    })

    return { target, damageResult }
  }

  incrementAllegiance(guildId: GuildId, amount: number) {
    if (!guildId) return

    let allegianceAmountToIncrement = (amount || 0) / 100

    const existingAllegiances = this.allegiances.filter(
      (a) => a.level > 1,
    )
    allegianceAmountToIncrement /=
      existingAllegiances.length + 1

    const maxAllegiance = 100
    const found = this.allegiances.find(
      (a) => a.guildId === guildId,
    )
    if (found)
      found.level = Math.min(
        maxAllegiance,
        (found.level || 0) + allegianceAmountToIncrement,
      )
    else
      this.allegiances.push({
        guildId,
        level: Math.min(
          maxAllegiance,
          allegianceAmountToIncrement,
        ),
      })
    this.toUpdate.allegiances = this.allegiances

    c.log({
      amount,
      allegianceAmountToIncrement,
      all: this.allegiances,
    })
    this.updateFrontendForShipsAt()
  }

  decrementAllegiances() {
    this.allegiances.forEach((a) => {
      if (this.guildId !== a.guildId)
        a.level = (a.level || 0) * 0.995
    })
    this.toUpdate.allegiances = this.allegiances
    this.updateFrontendForShipsAt()
  }

  updateFluctuator() {
    const intensity = BasicPlanet.priceFluctuatorIntensity
    const mod = (this.name || ``)
      .split(``)
      .reduce((t, c) => t + c.charCodeAt(0), 0)

    this.priceFluctuator =
      (((new Date().getDate() * 13 +
        mod +
        (new Date().getMonth() * 7 + mod)) %
        100) /
        100) *
        intensity +
      (1 - intensity / 2)

    this._stub = null // invalidate stub
    this.toUpdate.priceFluctuator = this.priceFluctuator
    this.updateFrontendForShipsAt()
  }

  broadcastTo(ship: HumanShip): number | undefined {
    const distanceAsPercentOfMaxBroadcastRadius =
      super.broadcastTo(ship)
    if (!distanceAsPercentOfMaxBroadcastRadius) return

    const garbleAmount = c.randomBetween(
      0.01,
      distanceAsPercentOfMaxBroadcastRadius,
    )
    let messageOptions = [
      `Do you read me, ${ship.name}? This is ${this.name}. Come in, over.`,
      `Hail, ${ship.name}!`,
    ]
    if (this.pacifist)
      messageOptions.push(
        `Come rest awhile at ${this.name}!`,
        `Welcome, ${ship.name}. Come rest and recharge.`,
        `Hail, ${ship.name}! You look a little worse for wear!`,
      )
    if (this.level > 5)
      messageOptions.push(
        `Come see what we have in stock!`,
        `Come browse our wares! Nothing but the lowest prices!`,
      )
    if (this.guildId === ship.guildId) {
      messageOptions.push(
        `Greetings, fellow creature of the ${
          ship.guildId && c.guilds[ship.guildId].name
        }! Swim swiftly!`,
      )
    } else {
      messageOptions.push(
        `You there, from the ${
          ship.guildId && c.guilds[ship.guildId].name
        }! You may land, but don't cause any trouble.`,
        `${
          ship.guildId && c.guilds[ship.guildId].name
        } are welcome here.`,
      )
    }

    const message = c.garble(
      c.randomFromArray(messageOptions),
      garbleAmount,
    )
    ship.receiveBroadcast(message, this, garbleAmount, [
      ship,
    ])
  }

  respondTo(
    message: string,
    ship: HumanShip,
  ): number | undefined {
    const distanceAsPercentOfMaxBroadcastRadius =
      super.respondTo(message, ship)
    if (!distanceAsPercentOfMaxBroadcastRadius) return

    const garbleAmount = c.randomBetween(
      0.01,
      distanceAsPercentOfMaxBroadcastRadius,
    )
    const responseOptions = [
      `I read you, ${ship.name}. Our docking bays are ready to receive, over.`,
      `You are clear for landing, over.`,
      `Roger that, over.`,
      `10-4, over.`,
      `I read you, ${ship.name}.`,
      `Loud and clear, ${ship.name}.`,
      `This is ${this.name}, I read you, ${ship.name}. Commence landing approach when ready.`,
      `I'm not authorized to respond to you, over.`,
      `Come down and let's take a swim, over.`,
      `${
        ship.guildId && c.guilds[ship.guildId].name
      } are always welcome here, over.`,
      `${
        ship.guildId && c.guilds[ship.guildId].name
      } are always welcome as long as they don't cause any trouble, over.`,
      `Meet me at the cantina later, over.`,
    ]
    if (this.creatures) {
      responseOptions.push(
        `Can't talk now, the ${c.randomFromArray(
          this.creatures,
        )} are causing trouble again, over.`,
        `Aren't ${c.randomFromArray(
          this.creatures,
        )} beautiful? Over.`,
      )
    }
    const response = c.garble(
      c.randomFromArray(responseOptions),
      garbleAmount,
    )
    ship.receiveBroadcast(response, this, garbleAmount, [
      ship,
    ])
  }

  resetLevels(toDefault = false) {
    // c.log(`resetLevels`, this.name)
    const targetLevel = toDefault
      ? this.homeworld
        ? c.defaultHomeworldLevel
        : Math.ceil(
            Math.random() * 5 +
              c.distance(this.location, [0, 0]) / 3,
          )
      : this.level
    const targetXp = toDefault ? 0 : this.xp
    this.level = 0
    this.xp = 0
    this.bank = false
    this.vendor = {
      cargo: [],
      items: [],
      chassis: [],
      passives: [],
      shipCosmetics: [],
    }
    this.passives = []
    this.landingRadiusMultiplier = 1

    while (this.level < targetLevel) {
      this.levelUp()
    }
    if (
      targetXp >
      c.levels[this.level - 1] *
        c.planetLevelXpRequirementMultiplier
    )
      this.xp = targetXp
    this.updateFrontendForShipsAt()
  }
}

function getBuyAndSellMultipliers(item: boolean = false) {
  const buyMultiplier = c.r2(0.8 + Math.random() * 0.4, 3)
  const sellMultiplier =
    Math.min(
      buyMultiplier,
      c.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3),
    ) * (item ? 0.4 : 1)
  return { buyMultiplier, sellMultiplier }
}

function getRepairCostMultiplier() {
  const repairCostVariance = 0.5
  const repairCostMultiplier = c.r2(
    1 +
      Math.random() * repairCostVariance -
      repairCostVariance / 2,
    3,
  )
  return repairCostMultiplier
}
