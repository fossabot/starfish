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
    (0.00001 *
      gameConstants.gameSpeedMultiplier *
      (10 / maxHp) *
      math.lerp(1, 0.5, useLevel / 100)) /
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
  return (
    math.lerp(
      0.0002 * flatMod,
      0.0005 * flatMod,
      level / 100,
    ) * gameConstants.gameSpeedMultiplier
  )
}

function getThrustMagnitudeForSingleCrewMember(
  level: number = 1,
  engineThrustMultiplier: number = 1,
  baseEngineThrustMultiplier: number,
): number {
  const min: number = 0.65
  const max: number = 1.5
  return (
    math.lerp(min, max, level / 100) *
    engineThrustMultiplier *
    baseEngineThrustMultiplier
  )
}

function getRepairAmountPerTickForSingleCrewMember(
  level: number,
) {
  return (
    (math.lerp(0.1, 0.3, level / 100) /
      globals.tickInterval) *
    gameConstants.gameSpeedMultiplier
  )
}

function getMineAmountPerTickForSingleCrewMember(
  level: number,
) {
  return (
    (math.lerp(30, 100, level / 100) /
      globals.tickInterval) *
    gameConstants.gameSpeedMultiplier
  )
}

function getStaminaGainPerTickForSingleCrewMember(
  baseStaminaUse: number,
) {
  return baseStaminaUse * 1.5
}

function getWeaponCooldownReductionPerTick(level: number) {
  return (
    (2 + math.lerp(1, 20, level / 100)) *
    3 *
    gameConstants.gameSpeedMultiplier
  )
}

function statToString(data: {
  stat: string
  amount: number
}): string {
  const { stat, amount } = data
  let titleString = text.camelCaseToWords(stat)
  let amountString = math.r2(amount)
  let suffix = ``

  if ([`planetTime`].includes(stat)) {
    amountString = math.r2(amount / 1000 / 60, 0, true)
    suffix = `h`
  }

  if ([`distanceTraveled`].includes(stat)) suffix = `AU`

  return `${text.capitalize(
    titleString,
  )}: ${text.numberWithCommas(amountString)}${suffix}`
}

function getPlanetTitle(planet: PlanetStub) {
  if (!planet || !planet.level) return ``

  let names: string[] = []

  if (planet.planetType === `mining`)
    names = [
      `Wasteland`,
      `Barrens`,
      `Raw Wilds`,
      `Wilds`,
      // `Fertile Grounds`,
      `Outcrops`,
      `Open Pits`,
      `Sheltered Pits`,
      `Hollows`,
      `Quarries`,
      `Tiered Quarries`,
      `Raw Shafts`,
      `Rich Shafts`,
      `Bare Caverns`,
      `Caverns`,
      `Cave Systems`,
      `Rich Veins`,
      `Extractors`,
      `Labyrinths`,
      `Gilded Halls`,
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
      `Municipality`,
      `Dockyard`,
      `Landing`,
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
  amount: number,
  factionId?: FactionId,
) {
  const buyPrice = getCargoBuyPrice(
    cargoId,
    planet,
    amount,
    factionId,
  )

  const sellMultiplier =
    planet?.vendor?.cargo?.find(
      (cbb) => cbb.id === cargoId && cbb.sellMultiplier,
    )?.sellMultiplier ||
    gameConstants.baseCargoSellMultiplier

  return Math.min(
    buyPrice,
    Math.floor(
      cargo[cargoId].basePrice *
        sellMultiplier *
        amount *
        planet.priceFluctuator *
        ((planet.allegiances.find(
          (a) => a.factionId === factionId,
        )?.level || 0) >=
        gameConstants.factionAllegianceFriendCutoff
          ? 1 +
            (1 -
              (gameConstants.factionVendorMultiplier || 1))
          : 1),
    ),
  )
}

function getCargoBuyPrice(
  cargoId: CargoId,
  planet: PlanetStub,
  amount: number,
  factionId?: FactionId,
) {
  const cargoForSale = planet?.vendor?.cargo?.find(
    (cfs) => cfs.id === cargoId && cfs.buyMultiplier,
  )
  if (!cargoForSale) return 99999
  return Math.ceil(
    cargo[cargoId].basePrice *
      cargoForSale.buyMultiplier *
      amount *
      planet?.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.factionId === factionId,
      )?.level || 0) >=
      gameConstants.factionAllegianceFriendCutoff
        ? gameConstants.factionVendorMultiplier
        : 1),
  )
}

function getRepairPrice(
  planet: PlanetStub,
  hp: number,
  factionId?: FactionId,
) {
  return math.r2(
    (planet.vendor?.repairCostMultiplier || 1) *
      gameConstants.baseRepairCost *
      hp *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.factionId === factionId,
      )?.level || 0) >=
      gameConstants.factionAllegianceFriendCutoff
        ? gameConstants.factionVendorMultiplier
        : 1),
    0,
    true,
  )
}

function getCrewPassivePrice(
  passiveForSale: PlanetVendorCrewPassivePrice,
  currentLevel: number,
  planet: PlanetStub,
  factionId?: FactionId,
) {
  return Math.ceil(
    (crewPassives[passiveForSale.id].buyable?.basePrice ||
      99999) *
      passiveForSale.buyMultiplier *
      (1 + currentLevel ** 2) *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.factionId === factionId,
      )?.level || 0) >=
      gameConstants.factionAllegianceFriendCutoff
        ? gameConstants.factionVendorMultiplier
        : 1),
  )
}

function getItemBuyPrice(
  itemForSale: PlanetVendorItemPrice,
  planet: PlanetStub,
  factionId?: FactionId,
) {
  return math.r2(
    (items[itemForSale.type][itemForSale.id].basePrice ||
      1) *
      itemForSale.buyMultiplier *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.factionId === factionId,
      )?.level || 0) >=
      gameConstants.factionAllegianceFriendCutoff
        ? gameConstants.factionVendorMultiplier
        : 1),
    0,
    true,
  )
}

function getItemSellPrice(
  itemType: ItemType,
  itemId: ItemId,
  planet: PlanetStub,
  factionId?: FactionId,
) {
  const itemData = items[itemType][itemId]
  if (!itemData) return 9999999
  return math.r2(
    (itemData?.basePrice || 9999999) *
      gameConstants.baseItemSellMultiplier *
      planet.priceFluctuator *
      (planet.faction === factionId
        ? 1 +
          (1 - gameConstants.factionVendorMultiplier || 1)
        : 1),
    0,
    true,
  )
}

function getChassisSwapPrice(
  chassis: PlanetVendorChassisPrice,
  planet: PlanetStub,
  currentChassisId: ChassisId,
  factionId?: FactionId,
) {
  const currentChassisSellPrice = Math.floor(
    (items.chassis[currentChassisId]?.basePrice || 0) *
      gameConstants.baseItemSellMultiplier,
  )
  return math.r2(
    Math.min(
      (items.chassis[chassis.id]?.basePrice || 1) *
        chassis.buyMultiplier *
        planet.priceFluctuator *
        (planet.faction === factionId
          ? 1 +
            (1 - gameConstants.factionVendorMultiplier || 1)
          : 1) -
        currentChassisSellPrice,
    ),
    0,
    true,
  )
}

function getPlanetPopulation(planet: PlanetStub): number {
  if (!planet) return 0
  return math.r2(
    ((planet &&
      planet.name
        .split(``)
        .reduce((t, c) => t + c.charCodeAt(0), 0) % 200) +
      20) **
      (planet.level / 30) *
      planet.radius,
    0,
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
  // getPlanetDescription,
}
