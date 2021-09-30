import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { HumanShip } from '../Ship/HumanShip'
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

export class BasicPlanet extends Planet {
  static readonly priceFluctuatorIntensity = 0.8

  readonly allegiances: PlanetAllegianceData[]
  readonly leanings: PlanetLeaning[]

  vendor: PlanetVendor

  priceFluctuator = 1

  toUpdate: {
    vendor?: PlanetVendor
    allegiances?: PlanetAllegianceData[]
    priceFluctuator?: number
    landingRadiusMultiplier?: number
    passives?: ShipPassiveEffect[]
  } = {}

  constructor(data: BaseBasicPlanetData, game: Game) {
    super(data, game)
    this.planetType = `basic`

    this.guildId = data.guildId ? data.guildId : undefined

    this.homeworld = this.guildId

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

    // c.log(this.getAddableToVendor())
    // c.log(
    //   this.repairFactor,
    //   this.landingRadiusMultiplier,
    //   this.level,
    // )

    this.updateFluctuator()
    setInterval(
      () => this.updateFluctuator(),
      (1000 * 60 * 60 * 24) / c.gameSpeedMultiplier,
    ) // every day

    setInterval(
      () => this.decrementAllegiances(),
      (1000 * 60 * 60 * 24) / c.gameSpeedMultiplier,
    ) // every day

    if (this.guildId)
      this.incrementAllegiance(this.guildId, 100)

    if (this.homeworld)
      while (this.level < c.defaultHomeworldLevel)
        this.levelUp()
  }

  levelUp() {
    super.levelUp()

    const shipPassiveLeaning = this.leanings.find(
      (l) => l.type === `shipPassives`,
    )
    const shipPassiveMultiplier = shipPassiveLeaning?.never
      ? 0
      : shipPassiveLeaning?.propensity || 1

    const levelUpOptions = [
      { weight: 200 / this.level, value: `addItemToShop` },
      {
        weight: 1,
        value: `expandLandingZone`,
      },
      {
        weight: 6,
        value: `increaseAutoRepair`,
      },
      {
        weight: 3 * shipPassiveMultiplier,
        value: `boostSightRange`,
      },
      {
        weight: 3 * shipPassiveMultiplier,
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
    let levelUpEffect = c.randomWithWeights(levelUpOptions)

    // homeworlds always have repair factor to some degree
    if (this.level === 1 && this.homeworld)
      levelUpEffect = `increaseAutoRepair`

    if (levelUpEffect === `expandLandingZone`) {
      this.landingRadiusMultiplier *= 2
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
          !this.vendor?.passives.find(
            (p) => p.id === crewPassive.id,
          ) &&
          crewPassive.buyable
        )
          addable.push({
            class: `crewPassives`,
            id: crewPassive.id,
            propensity:
              propensity *
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

  incrementAllegiance(guildId?: GuildId, amount?: number) {
    if (!guildId) return
    const allegianceAmountToIncrement = amount || 1
    // c.log(`allegiance`, allegianceAmountToIncrement)
    const maxAllegiance = 100
    const found = this.allegiances.find(
      (a) => a.guildId === guildId,
    )
    if (found)
      found.level = Math.min(
        maxAllegiance,
        found.level + allegianceAmountToIncrement,
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
    this.updateFrontendForShipsAt()
  }

  decrementAllegiances() {
    this.allegiances.forEach((a) => {
      if (this.guildId !== a.guildId) a.level *= 0.99
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

  resetLevels() {
    // c.log(`resetLevels`, this.name)
    const targetLevel = this.level
    const targetXp = this.xp
    this.level = 0
    this.xp = 0
    this.vendor = {
      cargo: [],
      items: [],
      chassis: [],
      passives: [],
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
      buyMultiplier *
        c.guildVendorMultiplier *
        c.guildVendorMultiplier,
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
