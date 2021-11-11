import math from './math'
import globals from './globals'
import c from './log'
import text from './text'
import * as cargo from './cargo'
import crewPassives from './crewPassives'
import * as items from './items'
import gameConstants from './gameConstants'

function getHitDamage(
  weapon: { damage: number },
  totalMunitionsSkill: number = 0,
) {
  return (
    weapon.damage *
    math.lerp(1, 4, totalMunitionsSkill / 100)
  )
}

function getBaseDurabilityLossPerTick(
  maxHp: number,
  reliability: number,
  useLevel: number = 1,
) {
  return (
    ((0.001 / maxHp) * math.lerp(1, 0.5, useLevel / 100)) /
    reliability
  )
}

function getRadiusDiminishingReturns(
  totalValue: number,
  equipmentCount: number,
) {
  if (equipmentCount === 0) return 0
  return totalValue / Math.sqrt(equipmentCount) || 0 // this might be too harsh? 5 and 2 = 4.9
}

function getMaxCockpitChargeForSingleCrewMember(
  level: number = 1,
) {
  return 1
  // return math.lerp(1, 5, (level - 1) / 100)
}

function getCockpitChargePerTickForSingleCrewMember(
  level: number = 1,
) {
  const flatMod = 0.1
  return math.lerp(
    0.002 * flatMod,
    0.005 * flatMod,
    level / 100,
  )
}

function getThrustMagnitudeForSingleCrewMember(
  level: number = 1,
  engineThrustMultiplier: number = 1,
  baseEngineThrustMultiplier: number,
): number {
  const min: number = 0.45
  const max: number = 1.4
  return (
    math.lerp(min, max, level / 100) *
    engineThrustMultiplier *
    baseEngineThrustMultiplier
  )
}

function getRepairAmountPerTickForSingleCrewMember(
  level: number,
) {
  return math.lerp(1, 3, level / 100) / globals.tickInterval
}

function getMineAmountPerTickForSingleCrewMember(
  level: number,
) {
  return (
    math.lerp(180, 500, level / 100) / globals.tickInterval
  )
}

function getStaminaGainPerTickForSingleCrewMember(
  baseStaminaUse: number,
  rechargeSpeedMultiplier: number,
) {
  return baseStaminaUse * rechargeSpeedMultiplier
}

function getWeaponCooldownReductionPerTick(level: number) {
  return (2 + math.lerp(1, 10, level / 100)) * 20
}

/**
 * Returns a multiplier (1 being the baseline) that incorporates general improvement when alone AND when with friends
 */
function getGeneralMultiplierBasedOnCrewMemberProximity(
  cm: CrewMemberStub,
  crewMembers: CrewMemberStub[],
) {
  const boostPerMemberInSameRoom = cm.passives
    .filter(
      (p) =>
        p.id ===
        `generalImprovementPerCrewMemberInSameRoom`,
    )
    .reduce((total, p) => (p.intensity || 0) + total, 0)

  const boostForSolo = cm.passives
    .filter((p) => p.id === `generalImprovementWhenAlone`)
    .reduce((total, p) => (p.intensity || 0) + total, 0)

  if (!boostForSolo && !boostPerMemberInSameRoom) return 1
  const crewMembersInSameRoom = crewMembers.filter(
    (m) => cm.id !== m.id && cm.location === m.location,
  )
  if (crewMembersInSameRoom.length === 0)
    return boostForSolo + 1
  return (
    boostPerMemberInSameRoom *
      crewMembersInSameRoom.length +
    1
  )
}

function getPlanetDefenseRadius(level: number) {
  return math.lerp(0.03, 2, level / 100)
}
function getPlanetDefenseDamage(level: number) {
  return (
    math.lerp(0.3, 5, level / 100) *
    math.randomBetween(0.9, 1.1)
  )
}

function statToString(data: {
  stat: string
  amount: number
}): string {
  const { stat, amount } = data
  let titleString = text.camelCaseToWords(stat)
  let amountString: string = `${text.numberWithCommas(
    math.r2(amount),
  )}`
  let suffix = ``

  if ([`highestSpeed`, `totalSpeedApplied`].includes(stat))
    amountString = text.speedNumber(amount)

  if ([`planetTime`, `timeInBunk`].includes(stat))
    amountString = text.msToTimeString(
      amount * globals.tickInterval,
    )

  if ([`distanceTraveled`].includes(stat)) suffix = `AU`

  return `${text.capitalize(
    titleString,
  )}: ${amountString}${suffix}`
}

function getPlanetTitle(planet: PlanetStub) {
  if (!planet || !planet.level) return ``

  let names: string[] = []

  if (planet.planetType === `mining`)
    names = [
      `Wasteland`,
      `Sands`,
      `Barrens`,
      `Raw Wilds`,
      `Wilds`,
      `Outcrops`,
      `Fertile Grounds`,
      `Open Pits`,
      `Sheltered Pits`,
      `Hollows`,
      `Rich Hollows`,
      `Depths`,
      `Quarries`,
      `Tiered Quarries`,
      `Machined Quarries`,
      `Raw Shafts`,
      `Shafts`,
      `Rich Shafts`,
      `Bare Caverns`,
      `Caverns`,
      `Tiered Caverns`,
      `Cave Systems`,
      `Extractors`,
      `Automated Extractors`,
      `Labyrinths`,
      `Deep Labyrinths`,
      `Ancient Labyrinths`,
      `Gilded Halls`,
      `Morian Halls`,
    ]

  if (planet.planetType === `basic`)
    names = [
      `Wilderness`,
      `Frontier`,
      `Vanguard`,
      `Outpost`,
      `Trading Post`,
      `Community`,
      `Settlement`,
      `Colony`,
      `Wharf`,
      `Dockyard`,
      `Landing`,
      `Municipality`,
      `Trade Hub`,
      `Ecosystem`,
      `Skyport`,
      `Spaceport`,
      `Cosmic Quayage`,
      `Cosmodrome`,
      `Ecopolis`,
      `Metropolis`,
      `Cosmopolis`,
      `Megalopolis`,
      `Sector Hub`,
      `Galactic Marina`,
      `Stellar Waypoint`,
      `Galactic Nucleus`,
    ]

  return names[Math.floor(planet.level - 1)] || `Domain`
  // todo finish
}

function getCargoSellPrice(
  cargoId: CargoId,
  planet: PlanetStub,
  guildId?: GuildId,
  amount: number = 1,
) {
  const buyPrice =
    getCargoBuyPrice(cargoId, planet, guildId).credits || 0
  const buyPriceProximityLimit = 0.95

  const sellMultiplier =
    planet?.vendor?.cargo?.find(
      (cbb) => cbb.id === cargoId && cbb.sellMultiplier,
    )?.sellMultiplier ||
    gameConstants.baseCargoSellMultiplier

  return {
    credits: Math.min(
      Math.floor(
        buyPrice * amount * buyPriceProximityLimit,
      ),
      Math.floor(
        (cargo[cargoId].basePrice.credits || 0) *
          amount *
          sellMultiplier *
          (planet.priceFluctuator || 1) *
          ((planet.allegiances?.find(
            (a) => a.guildId === guildId,
          )?.level || 0) >=
          gameConstants.guildAllegianceFriendCutoff
            ? 1 +
              (1 -
                (gameConstants.guildVendorMultiplier || 1))
            : 1),
      ),
    ),
  }
}

function getCargoBuyPrice(
  cargoId: CargoId,
  planet: PlanetStub,
  guildId?: GuildId,
  amount: number = 1,
): Price {
  const cargoForSale = planet?.vendor?.cargo?.find(
    (cfs) => cfs.id === cargoId && cfs.buyMultiplier,
  )
  if (!cargoForSale) return { credits: 99999 }

  const multiplier =
    cargoForSale.buyMultiplier *
    (planet.priceFluctuator || 1) *
    ((planet.allegiances?.find((a) => a.guildId === guildId)
      ?.level || 0) >=
    gameConstants.guildAllegianceFriendCutoff
      ? gameConstants.guildVendorMultiplier
      : 1)

  const basePrice = cargo[cargoId].basePrice

  const price: Price = {}
  if (basePrice?.credits)
    price.credits = Math.ceil(
      basePrice.credits * multiplier * amount,
    )
  if (basePrice?.crewCosmeticCurrency)
    price.crewCosmeticCurrency = Math.ceil(
      basePrice.crewCosmeticCurrency * multiplier * amount,
    )
  if (basePrice?.shipCosmeticCurrency)
    price.shipCosmeticCurrency = Math.ceil(
      basePrice.shipCosmeticCurrency * multiplier * amount,
    )
  return price
}

function getRepairPrice(
  planet: PlanetStub,
  hp: number,
  guildId?: GuildId,
): Price {
  return {
    credits: math.r2(
      (planet.vendor?.repairCostMultiplier || 1) *
        gameConstants.baseRepairCost *
        hp *
        (planet.priceFluctuator || 1) *
        ((planet.allegiances?.find(
          (a) => a.guildId === guildId,
        )?.level || 0) >=
        gameConstants.guildAllegianceFriendCutoff
          ? gameConstants.guildVendorMultiplier
          : 1),
      0,
      true,
    ),
  }
}

function getCrewPassivePrice(
  passiveForSale: PlanetVendorCrewPassivePrice,
  currentIntensity: number,
  planet: PlanetStub,
  guildId?: GuildId,
): Price {
  const multiplier =
    passiveForSale.buyMultiplier *
    (1 +
      (currentIntensity /
        (crewPassives[passiveForSale.id].buyable
          ?.baseIntensity || 1)) **
        2) *
    (planet.priceFluctuator || 1) *
    ((planet.allegiances?.find((a) => a.guildId === guildId)
      ?.level || 0) >=
    gameConstants.guildAllegianceFriendCutoff
      ? gameConstants.guildVendorMultiplier
      : 1)

  const basePrice = {
    ...crewPassives[passiveForSale.id].buyable?.basePrice,
  }
  const scaledCrewCosmeticCurrency =
    crewPassives[passiveForSale.id].buyable
      ?.scaledCrewCosmeticCurrency
  const addScaledCrewCosmeticCurrency =
    scaledCrewCosmeticCurrency?.fromLevel !== undefined &&
    currentIntensity /
      (crewPassives[passiveForSale.id].buyable
        ?.baseIntensity || 1) -
      (scaledCrewCosmeticCurrency?.fromLevel || 0) +
      1 >
      0

  const price: Price = {}
  if (basePrice?.credits)
    price.credits = Math.ceil(
      basePrice.credits * multiplier,
    )
  if (
    basePrice?.crewCosmeticCurrency ||
    addScaledCrewCosmeticCurrency
  )
    price.crewCosmeticCurrency = Math.ceil(
      ((basePrice?.crewCosmeticCurrency || 0) +
        (scaledCrewCosmeticCurrency?.amount || 0)) *
        multiplier,
    )
  if (basePrice?.shipCosmeticCurrency)
    price.shipCosmeticCurrency = Math.ceil(
      basePrice.shipCosmeticCurrency * multiplier,
    )
  return price
}

function getItemBuyPrice(
  itemForSale: PlanetVendorItemPrice,
  planet: PlanetStub,
  guildId?: GuildId,
): Price {
  const multiplier =
    itemForSale.buyMultiplier *
    (planet.priceFluctuator || 1) *
    ((planet.allegiances?.find((a) => a.guildId === guildId)
      ?.level || 0) >=
    gameConstants.guildAllegianceFriendCutoff
      ? gameConstants.guildVendorMultiplier
      : 1)

  const price: Price = {}
  if (
    items[itemForSale.type][itemForSale.id]?.basePrice
      ?.credits
  )
    price.credits = Math.ceil(
      items[itemForSale.type][itemForSale.id].basePrice
        .credits * multiplier,
    )
  if (
    items[itemForSale.type][itemForSale.id]?.basePrice
      ?.crewCosmeticCurrency
  )
    price.crewCosmeticCurrency = Math.ceil(
      items[itemForSale.type][itemForSale.id].basePrice
        .crewCosmeticCurrency * multiplier,
    )
  if (
    items[itemForSale.type][itemForSale.id]?.basePrice
      ?.shipCosmeticCurrency
  )
    price.shipCosmeticCurrency = Math.ceil(
      items[itemForSale.type][itemForSale.id].basePrice
        .shipCosmeticCurrency * multiplier,
    )
  return price
}

function getItemSellPrice(
  itemType: ItemType,
  itemId: ItemId,
  planet: PlanetStub,
  guildId?: GuildId,
) {
  const itemData = items[itemType][itemId]
  if (!itemData) return 9999999
  return math.r2(
    (itemData?.basePrice?.credits || 0) *
      gameConstants.baseItemSellMultiplier *
      (planet.priceFluctuator || 1) *
      (planet.allegiances?.find(
        (a) => a.guildId === guildId,
      ) || gameConstants.guildAllegianceFriendCutoff < 0
        ? 1 + (1 - gameConstants.guildVendorMultiplier || 1)
        : 1),
    0,
    true,
  )
}

function getChassisSwapPrice(
  chassis: PlanetVendorChassisPrice,
  planet: PlanetStub,
  currentChassisId: ChassisId,
  guildId?: GuildId,
): Price {
  const multiplier =
    chassis.buyMultiplier *
    (planet.priceFluctuator || 1) *
    (planet.allegiances?.find(
      (a) => a.guildId === guildId,
    ) || gameConstants.guildAllegianceFriendCutoff < 0
      ? 1 + (1 - gameConstants.guildVendorMultiplier || 1)
      : 1)
  const currentChassisSellPrice = Math.floor(
    ((items.chassis[currentChassisId]?.basePrice || 0)
      .credits || 0) * gameConstants.baseItemSellMultiplier,
  )
  const price: Price = {}
  price.credits = math.r2(
    Math.max(
      (items.chassis[chassis.id]?.basePrice.credits || 0) -
        currentChassisSellPrice,
      0,
    ),
    0,
    true,
  )
  if (
    items.chassis[chassis.id]?.basePrice
      ?.crewCosmeticCurrency
  )
    price.crewCosmeticCurrency = Math.ceil(
      items.chassis[chassis.id].basePrice
        .crewCosmeticCurrency! * multiplier,
    )
  if (
    items.chassis[chassis.id]?.basePrice
      ?.shipCosmeticCurrency
  )
    price.shipCosmeticCurrency = Math.ceil(
      items.chassis[chassis.id].basePrice
        .shipCosmeticCurrency! * multiplier,
    )
  return price
}

function getGuildChangePrice(ship: {
  planet: PlanetStub | false
  guildId: GuildId
  crewMembers: CrewMemberStub[]
}): Price {
  if (!ship.guildId) return {}
  if (!ship.planet) return { credits: 999999 }

  const multiplier =
    3000 * (ship.planet?.priceFluctuator || 1)

  return {
    credits: math.r2(
      (ship.crewMembers?.length || 1) * multiplier,
      0,
      true,
    ),
    shipCosmeticCurrency:
      1 +
      math.r2(
        (ship.crewMembers?.length || 1) / 10,
        0,
        true,
      ),
  }
}

function getShipTaglinePrice(
  cosmetic: PlanetShipCosmetic,
): Price {
  const price: Price = {}
  price.shipCosmeticCurrency = Math.ceil(
    (cosmetic.tagline
      ? gameConstants.baseTaglinePrice
      : 0) * cosmetic.priceMultiplier,
  )
  return price
}
function getShipHeaderBackgroundPrice(
  cosmetic: PlanetShipCosmetic,
): Price {
  const price: Price = {}
  price.shipCosmeticCurrency = Math.ceil(
    (cosmetic.headerBackground
      ? gameConstants.baseHeaderBackgroundPrice
      : 0) * cosmetic.priceMultiplier,
  )
  return price
}

function getPlanetPopulation(planet: PlanetStub): number {
  if (!planet) return 0
  return math.r2(
    ((planet &&
      planet.name
        .split(``)
        .reduce((t, c) => t + c.charCodeAt(0), 0) % 200) +
      20) **
      ((planet.level || 1) / 20) *
      (planet.radius || 100000),
    0,
  )
}

function canAfford(
  price: Price,
  ship: {
    captain?: string | null
    commonCredits?: number
    shipCosmeticCurrency?: number
  },
  crewMember?: {
    id: string
    credits?: number
    crewCosmeticCurrency?: number
  } | null,
  useShipCommonCredits = false,
): false | number {
  if (price.credits) {
    if (
      !useShipCommonCredits &&
      (crewMember?.credits || 0) < price.credits
    )
      return false

    if (
      useShipCommonCredits &&
      crewMember &&
      ship.captain !== crewMember?.id
    )
      return false
    if (
      useShipCommonCredits &&
      (ship.commonCredits || 0) < price.credits
    )
      return false
  }
  if (
    (ship.shipCosmeticCurrency || 0) <
    (price.shipCosmeticCurrency || 0)
  )
    return false
  if (
    price.shipCosmeticCurrency &&
    crewMember &&
    ship.captain !== crewMember?.id
  )
    return false
  if (
    (crewMember?.crewCosmeticCurrency || 0) <
    (price?.crewCosmeticCurrency || 0)
  )
    return false

  return Math.min(
    price.credits
      ? useShipCommonCredits
        ? ship.commonCredits || 0
        : (crewMember?.credits || 0) / price.credits
      : Infinity,
    price.shipCosmeticCurrency
      ? (ship.shipCosmeticCurrency || 0) /
          price.shipCosmeticCurrency
      : Infinity,
    price.crewCosmeticCurrency
      ? (crewMember?.crewCosmeticCurrency || 0) /
          price.crewCosmeticCurrency
      : Infinity,
  )
}

// function getPlanetDescription(planet: PlanetStub): string {
//   if (!planet) return ``

//   const cargoCount = planet.vendor?.cargo?.length
//   const itemsCount = (planet.vendor as PlanetVendor)?.items
//     ?.length
//   const chassisCount = (planet.vendor as PlanetVendor)
//     ?.chassis?.length

//   let d = `The ${getPlanetTitle(
//     planet,
//   ).toLowerCase()} known as ${planet.name} is a ${
//     planet.radius > 50000
//       ? `large`
//       : planet.radius > 30000
//       ? `medium-sized`
//       : `small`
//   } planet`

//   const positiveLeanings = (
//     (planet.leanings as PlanetLeaning[]) || []
//   ).filter((l) => !l.never && (l.propensity || 0) > 0.5)
//   d += positiveLeanings.length
//     ? ` that specializes in selling ${text.printList(
//         positiveLeanings.map((l) =>
//           [
//             `weapon`,
//             `engine`,
//             `scanner`,
//             `communicator`,
//             `repair`,
//           ].includes(l.type)
//             ? l.type + `s`
//             : l.type,
//         ),
//       )}.`
//     : `.`

//   d +=
//     planet.creatures && planet.creatures.length
//       ? ` It is inhabited by a population of ${text.numberWithCommas(
//           getPlanetPopulation(planet),
//         )} ${text.printList(planet.creatures || [])}.`
//       : ``

//   // todo finish
//   return d
// }

export default {
  getHitDamage,
  getBaseDurabilityLossPerTick,
  getRadiusDiminishingReturns,
  getRepairAmountPerTickForSingleCrewMember,
  getMineAmountPerTickForSingleCrewMember,
  getMaxCockpitChargeForSingleCrewMember,
  getCockpitChargePerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  getStaminaGainPerTickForSingleCrewMember,
  getWeaponCooldownReductionPerTick,
  getGeneralMultiplierBasedOnCrewMemberProximity,
  statToString,
  getPlanetTitle,
  getPlanetPopulation,
  getCargoSellPrice,
  getCargoBuyPrice,
  getRepairPrice,
  getCrewPassivePrice,
  getItemBuyPrice,
  getItemSellPrice,
  getChassisSwapPrice,
  getGuildChangePrice,
  getShipTaglinePrice,
  getShipHeaderBackgroundPrice,
  canAfford,
  // getPlanetDescription,
  getPlanetDefenseRadius,
  getPlanetDefenseDamage,
}
