import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { Faction } from '../Faction'
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
    }
  | { class: `chassis`; id: ChassisId; propensity: number }
  // | {
  //     class: `actives`
  //     id: CrewActiveId
  //     propensity: number
  //   }
  | { class: `repair`; propensity: number }

export class BasicPlanet extends Planet {
  static readonly priceFluctuatorIntensity = 0.8

  readonly planetType: PlanetType
  readonly vendor: PlanetVendor
  readonly faction?: Faction
  readonly homeworld?: Faction
  readonly allegiances: PlanetAllegianceData[]
  readonly leanings: PlanetLeaning[]

  repairFactor: number

  priceFluctuator = 1

  toUpdate: {
    allegiances?: PlanetAllegianceData[]
    priceFluctuator?: number
    repairFactor?: number
    landingRadiusMultiplier?: number
  } = {}

  constructor(data: BaseBasicPlanetData, game: Game) {
    super(data, game)
    this.planetType = `basic`

    this.repairFactor = data.repairFactor || 0

    this.homeworld = game.factions.find(
      (f) => f.id === data.homeworld?.id,
    )
    this.faction = this.homeworld

    this.leanings = data.leanings || []

    this.allegiances = []
    if (data.allegiances) {
      for (let a of data.allegiances) {
        const foundFaction = this.game.factions.find(
          (f) => f.id === a.faction.id,
        )
        if (foundFaction)
          this.allegiances.push({
            faction: foundFaction,
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

    if (this.faction)
      this.incrementAllegiance(this.faction, 100)
  }

  async levelUp() {
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
        weight: 1.5,
        value: `expandLandingZone`,
      },
      {
        weight: 2.5,
        value: `increaseRepairFactor`,
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
        value: `boostRestSpeed`,
      },
      {
        weight: shipPassiveMultiplier * 1.01,
        value: `boostCockpitChargeSpeed`,
      },
    ]
    let levelUpEffect = c.randomWithWeights(levelUpOptions)

    // homeworlds always have repair factor to some degree
    if (this.level === 1 && this.homeworld)
      levelUpEffect = `increaseRepairFactor`

    if (levelUpEffect === `expandLandingZone`) {
      this.landingRadiusMultiplier += 1
    } else if (levelUpEffect === `increaseRepairFactor`) {
      this.repairFactor += 1
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
    } else if (levelUpEffect === `boostRestSpeed`) {
      this.addPassive({
        id: `boostRestSpeed`,
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
            })
          if (toAddToVendor.class === `cargo`)
            this.vendor.cargo.push({
              buyMultiplier,
              sellMultiplier,
              id: toAddToVendor.id,
            })
          // if (toAddToVendor.class === `actives`)
          //   this.vendor.actives.push({buyMultiplier, sellMultiplier, id: toAddToVendor.id})
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
          )
        )
          addable.push({
            class: `crewPassives`,
            id: crewPassive.id,
            propensity:
              propensity *
              rarityMultiplier(crewPassive.rarity),
          })
    }

    // if (
    //   !this.leanings.find(
    //     (p) => p.type === `actives` && p.never === true,
    //   )
    // ) {
    //   const propensity =
    //     (this.leanings.find((p) => p.type === `actives`)
    //       ?.propensity || 0.2) / Object.keys(c.crewActives).length
    //   for (let crewActive of Object.values(c.crewActives))
    //     if (
    //       !this.vendor?.actives.find(
    //         (p) => p.id === crewActive.id,
    //       )
    //     )
    //       addable.push({
    //         class: `actives`,
    //         id: crewActive.id,
    //         propensity:
    //           propensity *
    //           rarityMultiplier(crewActive.rarity),
    //       })
    // }

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

  incrementAllegiance(
    faction: Faction | FactionStub,
    amount?: number,
  ) {
    const allegianceAmountToIncrement = amount || 1
    // c.log(`allegiance`, allegianceAmountToIncrement)
    const maxAllegiance = 100
    const found = this.allegiances.find(
      (a) => a.faction.id === faction.id,
    )
    if (found)
      found.level = Math.min(
        maxAllegiance,
        found.level + allegianceAmountToIncrement,
      )
    else
      this.allegiances.push({
        faction,
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
      if (this.faction?.id !== a.faction.id) a.level *= 0.99
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
    if (this.faction === ship.faction) {
      messageOptions.push(
        `Greetings, fellow creature of the ${ship.faction.name}! Swim swiftly!`,
      )
    } else {
      messageOptions.push(
        `You there, from the ${ship.faction.name}! You may land, but don't cause any trouble.`,
        `${ship.faction.name} are welcome here.`,
      )
    }
    if (this.creatures?.includes(ship.species.id))
      messageOptions.push(
        `Hail, fellow ${ship.species.singular}! You're always welcome here.`,
      )
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
      `This is ${this.name}, I read you, ${ship.name}. Commence landing approach when ready.`,
      `I'm not authorized to respond to you, over.`,
      `Come down and let's take a swim, over.`,
      `We love ${ship.species.id} around here, over.`,
      `${ship.faction.name} are always welcome here, over.`,
      `${ship.faction.name} are always welcome as long as they don't cause any trouble, over.`,
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
}

function getBuyAndSellMultipliers(item: boolean = false) {
  const buyMultiplier = c.r2(0.8 + Math.random() * 0.4, 3)
  const sellMultiplier =
    Math.min(
      buyMultiplier *
        c.factionVendorMultiplier *
        c.factionVendorMultiplier,
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
