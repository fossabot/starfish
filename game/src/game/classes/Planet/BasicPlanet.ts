import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { AIShip } from '../Ship/AIShip/AIShip'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
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
  | {
      class: `shipTagline`
      value: string
      propensity: number
      rarity: number
    }
  | {
      class: `shipBackground`
      value: ShipBackground
      propensity: number
      rarity: number
    }
  | {
      class: `crewTagline`
      value: string
      propensity: number
      rarity: number
    }
  | {
      class: `crewBackground`
      value: CrewBackground
      propensity: number
      rarity: number
    }

export class BasicPlanet extends Planet {
  static readonly priceFluctuatorIntensity = 0.4 // in either direction

  readonly leanings: PlanetLeaning[]

  vendor: PlanetVendor
  bank: boolean = false
  contracts: PlanetContractAvailable[] = []
  maxContracts: number = 0

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
    if (this.guildId) this.color = c.guilds[this.guildId].color

    this.leanings = data.leanings || []

    this.allegiances = []
    if (data.allegiances) {
      for (let a of data.allegiances) {
        if (c.guilds[a.guildId])
          this.allegiances.push({
            guildId: a.guildId,
            level: a.level || 0,
          })
      }
      this.toUpdate.allegiances = this.allegiances
    }

    this.vendor = data.vendor
    this.bank = data.bank
    this.maxContracts = data.maxContracts || 0
    this.contracts = data.contracts || []
    // c.log(this.name, this.contracts)

    // c.log(this.getAddableToVendor())
    // c.log(
    //   this.repairFactor,
    //   this.landingRadiusMultiplier,
    //   this.level,
    // )

    this.updateFluctuator()
    this.refreshContracts()
    setInterval(() => {
      this.updateFluctuator()
      this.decrementAllegiances()
    }, 1000 * 60 * 60 * 24 * 0.1) // every 1/10th of a day

    setInterval(() => {
      this.refreshContracts()
    }, 1000 * 60 * 60 * 24) // every day

    if (this.guildId) this.incrementAllegiance(this.guildId, 1000000)

    if (this.homeworld)
      while (this.level < c.defaultHomeworldLevel) this.levelUp()
  }

  tick() {
    super.tick()
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
      { weight: 600 / this.level, value: `addItemToShop` },
      {
        weight: 1,
        value: `expandLandingZone`,
      },
      {
        weight: 5,
        value: `increaseAutoRepair`,
      },
      {
        weight: 4 * c.distance([0, 0], this.location),
        value: `increaseMaxContracts`,
      },
      {
        weight: 8 * defenseMultiplier,
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
        weight: 1.01 * shipPassiveMultiplier,
        value: `boostBroadcastRange`,
      },
      {
        weight: 1.01 * shipPassiveMultiplier,
        value: `boostRepairSpeed`,
      },
      {
        weight: 1.01 * shipPassiveMultiplier,
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
    if (this.level === 1 && this.homeworld) levelUpEffect = `increaseAutoRepair`

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
    } else if (levelUpEffect === `increaseMaxContracts`) {
      this.maxContracts++
      this.refreshContracts()
    } else if (levelUpEffect === `boostSightRange`) {
      this.addPassive({
        id: `boostSightRange`,
        intensity: 0.1,
      })
    } else if (levelUpEffect === `boostStaminaRegeneration`) {
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
    } else if (levelUpEffect === `boostCockpitChargeSpeed`) {
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

        // if (toAddToVendor.class === `repair`)
        //   this.vendor.repairCostMultiplier =
        //     getRepairCostMultiplier()
        // else {
        const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers()
        if (
          toAddToVendor.class === `items` &&
          toAddToVendor.type &&
          toAddToVendor.id
        ) {
          // c.log(this.vendor.items, toAddToVendor)
          this.vendor.items.push({
            buyMultiplier,
            id: toAddToVendor.id,
            type: toAddToVendor.type,
          })
        } else if (toAddToVendor.class === `items`)
          c.log(
            `red`,
            `Attempted to add an item to a vendor that did not have the proper data:`,
            toAddToVendor,
          )

        if (toAddToVendor.class === `shipTagline`)
          this.vendor.shipCosmetics.push({
            tagline: toAddToVendor.value,
            priceMultiplier: buyMultiplier ** 2 * (toAddToVendor.rarity / 5),
          })
        if (toAddToVendor.class === `shipBackground`)
          this.vendor.shipCosmetics.push({
            headerBackground: toAddToVendor.value,
            priceMultiplier: buyMultiplier ** 2 * (toAddToVendor.rarity / 5),
          })

        if (toAddToVendor.class === `crewTagline`)
          this.vendor.crewCosmetics.push({
            tagline: toAddToVendor.value,
            priceMultiplier: buyMultiplier ** 2 * (toAddToVendor.rarity / 5),
          })
        if (toAddToVendor.class === `crewBackground`)
          this.vendor.crewCosmetics.push({
            background: toAddToVendor.value,
            priceMultiplier: buyMultiplier ** 2 * (toAddToVendor.rarity / 5),
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
        // }
      }
    }

    this.updateFrontendForShipsAt()
  }

  getAddableToVendor(): AddableElement[] {
    const targetRarity = Math.max(0, this.level - 2) / 3
    const rarityMultiplier = (rarity: number) =>
      1 / (Math.abs(rarity - targetRarity) + 1)
    const addable: AddableElement[] = []

    if (!this.leanings.find((p) => p.type === `cargo` && p.never === true)) {
      const propensity =
        ((this.leanings.find((p) => p.type === `cargo`)?.propensity || 1) /
          Object.keys(c.cargo).length) *
        3
      // * multiplied to make cargo slightly more common
      for (let cargo of Object.values(c.cargo))
        if (!this.vendor?.cargo.find((ca) => ca.id === cargo.id))
          addable.push({
            class: `cargo`,
            id: cargo.id,
            propensity: propensity * rarityMultiplier(cargo.rarity),
          })
    }

    if (!this.leanings.find((l) => l.type === `items` && l.never === true)) {
      const baseItemPropensity =
        (this.leanings.find((l) => l.type === `items`)?.propensity || 1) * 4
      for (let itemGroup of Object.values(c.items)) {
        if (
          this.leanings.find(
            (p) =>
              p.type === Object.values(itemGroup)[0].type && p.never === true,
          )
        )
          continue

        let propensity =
          baseItemPropensity *
          (this.leanings.find(
            (p) => p.type === Object.values(itemGroup)[0].type,
          )?.propensity || 0.2)
        propensity /= Object.keys(itemGroup).length
        // * lightly encourage specialization
        const alreadySellingOfType =
          this.vendor?.items.filter(
            (i) => i.type === Object.values(itemGroup)[0].type,
          ).length || 0
        propensity *= 2 + alreadySellingOfType

        for (let item of Object.values(itemGroup) as BaseItemOrChassisData[])
          if (item.type === `chassis`) {
            if (
              item.buyable !== false &&
              !item.special &&
              !this.vendor?.chassis.find(
                (i) => i.id === (item as BaseChassisData).chassisId,
              )
            )
              addable.push({
                class: `chassis`,
                id: (item as BaseChassisData).chassisId,
                propensity: propensity * rarityMultiplier(item.rarity),
              })
          } else {
            if (
              item.buyable !== false &&
              !item.special &&
              !this.vendor?.items.find(
                (i) =>
                  i.type === (item as BaseItemData).itemType &&
                  i.id === (item as BaseItemData).itemId,
              )
            )
              addable.push({
                class: `items`,
                type: (item as BaseItemData).itemType,
                id: (item as BaseItemData).itemId,
                propensity: propensity * rarityMultiplier(item.rarity),
              })
          }
      }
    }

    if (
      !this.leanings.find((p) => p.type === `crewPassives` && p.never === true)
    ) {
      const propensity =
        (this.leanings.find((p) => p.type === `crewPassives`)?.propensity ||
          1) / Object.keys(c.crewPassives).length
      for (let crewPassive of Object.values(c.crewPassives))
        if (
          crewPassive.buyable &&
          !this.vendor?.passives.find((p) => p.id === crewPassive.id)
        )
          addable.push({
            class: `crewPassives`,
            id: crewPassive.id,
            propensity:
              propensity * 5 * rarityMultiplier(crewPassive.buyable.rarity),
            intensity:
              c.r2(
                c.crewPassives[crewPassive.id].buyable!.baseIntensity *
                  Math.random() +
                  0.5,
                c.crewPassives[crewPassive.id].buyable!.wholeNumbersOnly
                  ? 0
                  : 2,
              ) ||
              // could be zero, bounce back
              (c.crewPassives[crewPassive.id].buyable!.wholeNumbersOnly
                ? 1
                : 0.1),
          })
    }

    if (
      !this.leanings.find((p) => p.type === `cosmetics` && p.never === true)
    ) {
      const shipTaglinePropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)?.propensity || 1) /
        c.buyableShipTaglines.length
      for (let tagline of c.buyableShipTaglines)
        if (
          !this.vendor?.shipCosmetics.find((p) => p.tagline === tagline.value)
        )
          addable.push({
            class: `shipTagline`,
            value: tagline.value,
            propensity:
              shipTaglinePropensity * rarityMultiplier(tagline.rarity),
            rarity: tagline.rarity,
          })

      const shipBackgroundPropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)?.propensity || 1) /
        c.buyableShipBackgrounds.length
      for (let headerBackground of c.buyableShipBackgrounds)
        if (
          !this.vendor?.shipCosmetics.find(
            (p) =>
              p.headerBackground &&
              p.headerBackground?.url === headerBackground.value.url,
          )
        )
          addable.push({
            class: `shipBackground`,
            value: headerBackground.value,
            propensity:
              shipBackgroundPropensity *
              rarityMultiplier(headerBackground.rarity),
            rarity: headerBackground.rarity,
          })

      const crewTaglinePropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)?.propensity || 1) /
        c.buyableCrewTaglines.length
      for (let tagline of c.buyableCrewTaglines)
        if (
          !this.vendor?.crewCosmetics.find((p) => p.tagline === tagline.value)
        )
          addable.push({
            class: `crewTagline`,
            value: tagline.value,
            propensity:
              crewTaglinePropensity * rarityMultiplier(tagline.rarity),
            rarity: tagline.rarity,
          })

      const crewBackgroundPropensity =
        (this.leanings.find((p) => p.type === `cosmetics`)?.propensity || 1) /
        c.buyableCrewBackgrounds.length
      for (let background of c.buyableCrewBackgrounds)
        if (
          !this.vendor?.crewCosmetics.find(
            (p) => p.background && p.background?.url === background.value.url,
          )
        )
          addable.push({
            class: `crewBackground`,
            value: background.value,
            propensity:
              crewBackgroundPropensity * rarityMultiplier(background.rarity),
            rarity: background.rarity,
          })
    }

    // * this was kind of useless (and also didn't really belong here)
    // if (
    //   !this.leanings.find(
    //     (p) => p.type === `repair` && p.never === true,
    //   )
    // ) {
    //   const propensity =
    //     this.leanings.find((p) => p.type === `repair`)
    //       ?.propensity || 0.1
    //   if (!this.vendor?.repairCostMultiplier)
    //     addable.push({ class: `repair`, propensity })
    // }

    return addable
  }

  refreshContracts() {
    if (!this.maxContracts) return
    this.contracts = this.contracts.filter(
      (co) => Date.now() < co.claimableExpiresAt,
    )
    if (this.contracts.length === this.maxContracts) return

    // add new contracts
    let scanRange = 1,
      attempts = 0
    while (this.contracts.length < this.maxContracts) {
      if (attempts >= 100) return
      attempts++
      const validTargets = (
        this.game?.scanCircle(
          this.location,
          scanRange,
          null,
          [`aiShip`, `humanShip`],
          false,
        )?.ships || []
      ).filter(
        (s) =>
          !s.planet &&
          !(s as AIShip).until &&
          !this.contracts.find((co) => co.targetId === s.id) &&
          !this.allegiances.find((a) => a.guildId === s.guildId),
      )
      const hitListTargets = validTargets.filter((t) =>
        this.hitList.includes(t.id),
      )
      const target = c.randomFromArray(
        hitListTargets.length
          ? hitListTargets // only hit list humans can be targeted
          : validTargets.filter((s) => s.ai), // otherwise, only ais
      )
      if (!target) {
        scanRange += 0.2
        continue
      }

      const difficulty = (target as AIShip).level || 10
      const distance = c.distance(this.location, target.location) / scanRange // 0-1
      let reward: Price = {
        credits: 0,
        shipCosmeticCurrency: 0,
        crewCosmeticCurrency: 0,
      }
      while (
        (reward.credits || 0) +
          (reward.shipCosmeticCurrency || 0) +
          (reward.crewCosmeticCurrency || 0) ===
        0
      ) {
        reward = {
          credits: c.lottery(1, 12)
            ? 0
            : Math.max(
                0,
                c.r2(
                  2000 * difficulty * (distance + 0.1) * (Math.random() + 0.1),
                  0,
                ),
              ),
          shipCosmeticCurrency: c.lottery(1, 4)
            ? 0
            : Math.max(
                0,
                c.r2(
                  0.35 *
                    (difficulty - 3) *
                    (distance + 0.1) *
                    (Math.random() + 0.1),
                  0,
                  true,
                ),
              ),
          crewCosmeticCurrency: c.lottery(1, 5)
            ? 0
            : Math.max(
                0,
                c.r2(
                  400 *
                    (difficulty - 3) *
                    (distance + 0.1) *
                    (Math.random() + 0.1),
                  0,
                  true,
                ),
              ),
        }
      }
      this.contracts.push({
        id: `contract` + `${Math.random()}`.slice(2),
        reward,
        timeAllowed: Math.round(
          c.tickInterval * 60 * 60 * 24 * 7 * (distance + 0.2),
        ),
        targetId: target.id,
        targetName: target.name,
        targetGuildId: target.guildId,
        difficulty,
        claimCost: {
          credits: c.lottery(1, 12)
            ? 0
            : Math.max(0, c.r2(300 * difficulty * distance * Math.random(), 0)),
        },
        claimableExpiresAt: Date.now() + 1000 * 60 * 60 * 24,
      })
    }
    this.updateFrontendForShipsAt()
    // c.log(`added contract:`, this.name, this.contracts)
  }

  incrementAllegiance(guildId: GuildId, amount: number) {
    if (!guildId) return

    let allegianceAmountToIncrement = (amount || 0) / 100

    const existingAllegiances = this.allegiances.filter((a) => a.level > 1)
    allegianceAmountToIncrement /= existingAllegiances.length + 1

    const maxAllegiance = 100
    const found = this.allegiances.find((a) => a.guildId === guildId)
    if (found)
      found.level = Math.min(
        maxAllegiance,
        (found.level || 0) + allegianceAmountToIncrement,
      )
    else
      this.allegiances.push({
        guildId,
        level: Math.min(maxAllegiance, allegianceAmountToIncrement),
      })
    this.toUpdate.allegiances = this.allegiances

    // c.log({
    //   amount,
    //   allegianceAmountToIncrement,
    //   all: this.allegiances,
    // })
    this.updateFrontendForShipsAt()
  }

  decrementAllegiances() {
    ;[...this.allegiances].forEach((a) => {
      if (this.guildId !== a.guildId) a.level = (a.level || 0) * 0.995
      if (a.level < 0.01)
        this.allegiances.splice(this.allegiances.indexOf(a), 1)
    })
    this.toUpdate.allegiances = this.allegiances
    this.updateFrontendForShipsAt()
  }

  broadcastTo(ship: HumanShip): number | undefined {
    const distanceAsPercentOfMaxBroadcastRadius = super.broadcastTo(ship)
    if (!distanceAsPercentOfMaxBroadcastRadius) return

    const garbleAmount = c.randomBetween(
      0.01,
      distanceAsPercentOfMaxBroadcastRadius,
    )
    let messageOptions = [
      `Do you read me, ${ship.name}? This is ${this.name}. Come in, over.`,
      `Hail, ${ship.name}!`,
    ]
    if (this.vendor) {
      const goodCargoPrices = this.vendor.cargo.filter(
        (ca) =>
          c.getCargoBuyPrice(ca.id, this, ship.guildId, 1) <
          c.cargo[ca.id].basePrice,
      )
      goodCargoPrices.forEach((p) => {
        messageOptions.push(
          `We've got good prices on ${p.id}! Get it while it lasts!`,
        )
      })
      this.vendor.items.forEach((p) => {
        messageOptions.push(
          `${
            c.items[p.type][p.id].displayName
          }, for sale here for only ${c.priceToString(
            c.getItemBuyPrice(p, this, ship.guildId),
          )}!`,
        )
      })
      this.vendor.chassis.forEach((p) => {
        messageOptions.push(
          `${
            c.items.chassis[p.id].displayName
          } for sale! Trade yours in for only ${c.priceToString(
            c.getChassisSwapPrice(
              p,
              this,
              ship.chassis.chassisId,
              ship.guildId,
            ),
          )}!`,
        )
      })
    }
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
    if (
      this.allegiances.find(
        (a) =>
          a.guildId === ship.guildId &&
          a.level >= c.guildAllegianceFriendCutoff,
      )
    ) {
      messageOptions.push(
        `Greetings, creature of the ${
          ship.guildId && c.guilds[ship.guildId].name
        }! Swim swiftly!`,
      )
    } else {
      messageOptions.push(
        `You there, from the ${
          ship.guildId && c.guilds[ship.guildId].name
        }! You may land, but don't cause any trouble.`,
        `${ship.guildId && c.guilds[ship.guildId].name} are welcome here.`,
      )
    }

    const message = c.garble(c.randomFromArray(messageOptions), garbleAmount)
    ship.receiveBroadcast(message, this, garbleAmount, [ship])
  }

  respondTo(message: string, ship: HumanShip): number | undefined {
    const distanceAsPercentOfMaxBroadcastRadius = super.respondTo(message, ship)
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
        `Aren't ${c.randomFromArray(this.creatures)} beautiful? Over.`,
      )
    }
    const response = c.garble(c.randomFromArray(responseOptions), garbleAmount)
    ship.receiveBroadcast(response, this, garbleAmount, [ship])
  }

  resetLevels(toDefault = false) {
    const targetLevel = toDefault
      ? this.homeworld
        ? c.defaultHomeworldLevel
        : Math.ceil(Math.random() * 5 + c.distance(this.location, [0, 0]) / 3)
      : this.level
    const targetXp = toDefault ? 0 : this.xp

    super.resetLevels()
    // c.log(`resetLevels`, this.name)
    this.bank = false
    this.maxContracts = 0
    this.contracts = []
    this.vendor = {
      cargo: [],
      items: [],
      chassis: [],
      passives: [],
      shipCosmetics: [],
      crewCosmetics: [],
    }
    this.passives = []
    this.landingRadiusMultiplier = 1

    while (this.level < targetLevel) {
      this.levelUp()
    }
    if (
      targetXp >
      c.levels[this.level - 1] * c.planetLevelXpRequirementMultiplier
    )
      this.xp = targetXp
    this.updateFrontendForShipsAt()
  }

  updateFluctuator() {
    const intensity = BasicPlanet.priceFluctuatorIntensity
    const mod = (this.name || ``)
      .split(``)
      .reduce((t, c) => t + c.charCodeAt(0), 0)

    const dateDependentRandomNumberBetweenZeroAndOne =
      ((new Date().getDate() * 13 + mod + (new Date().getMonth() * 7 + mod)) %
        100) /
      100

    this.priceFluctuator =
      1 +
      (dateDependentRandomNumberBetweenZeroAndOne * intensity * 2 - intensity)

    this._stub = null // invalidate stub
    this.toUpdate.priceFluctuator = this.priceFluctuator
    this.updateFrontendForShipsAt()
  }
}

function getBuyAndSellMultipliers(item: boolean = false) {
  const overallBoost = 0.1
  const buyMultiplier = c.r2(0.8 + Math.random() * 0.4 + overallBoost, 2)
  const sellMultiplier =
    Math.min(
      buyMultiplier,
      c.r2(buyMultiplier * (Math.random() * 0.2) + 0.8 + overallBoost, 2),
    ) * (item ? 0.4 : 1)
  return { buyMultiplier, sellMultiplier }
}

function getRepairCostMultiplier() {
  const repairCostVariance = 0.5
  const repairCostMultiplier = c.r2(
    1 + Math.random() * repairCostVariance - repairCostVariance / 2,
    3,
  )
  return repairCostMultiplier
}

/*
contracts!

only certain planets have contracts
  (level-up chance)

planet holds contracts to kill specific nearby enemies
  1+, depending on level
  could be an ai, or even a non-allied player
    keeps a list of aggro ships from orbital defense
  contracts refresh every week
  contract faction is visible
  approx. distance is visible
  contracts have visible rewards based on how hard the enemy was
    over level 5, gives crew cosmetic currency
    over level 10, gives ship cosmetic currency

accepting contracts
  1 at a time
  highlights a zone of the map that the enemy is in
  contracts expire after a certain amount of time
  contracts can be cancelled

if a human ship is hunted, notifies them of the hunt, the hunter, and the timeframe

once the enemy is killed
  sets done flag in ship jobs
  returning to that planet claims the reward

if the contract expires
  contract sticks around in the UI as "failed" until cleared or another contract is taken
  human ship is notified

if the enemy is killed by someone else
  notify contractor ship
    return to planet to get half reward

tone down ai drop amounts to make the contracts worth it

*/
