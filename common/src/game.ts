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
) {
  return baseStaminaUse * 1.5
}

function getWeaponCooldownReductionPerTick(level: number) {
  return (2 + math.lerp(1, 10, level / 100)) * 30
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
      `Barrens`,
      `Raw Wilds`,
      `Wilds`,
      // `Fertile Grounds`,
      `Outcrops`,
      `Open Pits`,
      `Sheltered Pits`,
      `Hollows`,
      `Depths`,
      `Quarries`,
      `Tiered Quarries`,
      `Raw Shafts`,
      `Rich Shafts`,
      `Bare Caverns`,
      `Caverns`,
      `Cave Systems`,
      `Extractors`,
      `Automated Extractors`,
      `Labyrinths`,
      `Deep Labyrinths`,
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
) {
  const buyPrice = getCargoBuyPrice(
    cargoId,
    planet,
    guildId,
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
        planet.priceFluctuator *
        ((planet.allegiances.find(
          (a) => a.guildId === guildId,
        )?.level || 0) >=
        gameConstants.guildAllegianceFriendCutoff
          ? 1 +
            (1 - (gameConstants.guildVendorMultiplier || 1))
          : 1),
    ),
  )
}

function getCargoBuyPrice(
  cargoId: CargoId,
  planet: PlanetStub,
  guildId?: GuildId,
) {
  const cargoForSale = planet?.vendor?.cargo?.find(
    (cfs) => cfs.id === cargoId && cfs.buyMultiplier,
  )
  if (!cargoForSale) return 99999
  return Math.ceil(
    cargo[cargoId].basePrice *
      cargoForSale.buyMultiplier *
      planet?.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.guildId === guildId,
      )?.level || 0) >=
      gameConstants.guildAllegianceFriendCutoff
        ? gameConstants.guildVendorMultiplier
        : 1),
  )
}

function getRepairPrice(
  planet: PlanetStub,
  hp: number,
  guildId?: GuildId,
) {
  return math.r2(
    (planet.vendor?.repairCostMultiplier || 1) *
      gameConstants.baseRepairCost *
      hp *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.guildId === guildId,
      )?.level || 0) >=
      gameConstants.guildAllegianceFriendCutoff
        ? gameConstants.guildVendorMultiplier
        : 1),
    0,
    true,
  )
}

function getCrewPassivePrice(
  passiveForSale: PlanetVendorCrewPassivePrice,
  currentIntensity: number,
  planet: PlanetStub,
  guildId?: GuildId,
) {
  return Math.ceil(
    (crewPassives[passiveForSale.id].buyable?.basePrice ||
      99999) *
      passiveForSale.buyMultiplier *
      (1 +
        (currentIntensity /
          (crewPassives[passiveForSale.id].buyable
            ?.baseIntensity || 1)) **
          2) *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.guildId === guildId,
      )?.level || 0) >=
      gameConstants.guildAllegianceFriendCutoff
        ? gameConstants.guildVendorMultiplier
        : 1),
  )
}

function getItemBuyPrice(
  itemForSale: PlanetVendorItemPrice,
  planet: PlanetStub,
  guildId?: GuildId,
) {
  return math.r2(
    (items[itemForSale.type][itemForSale.id].basePrice ||
      1) *
      itemForSale.buyMultiplier *
      planet.priceFluctuator *
      ((planet.allegiances.find(
        (a) => a.guildId === guildId,
      )?.level || 0) >=
      gameConstants.guildAllegianceFriendCutoff
        ? gameConstants.guildVendorMultiplier
        : 1),
    0,
    true,
  )
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
    (itemData?.basePrice || 9999999) *
      gameConstants.baseItemSellMultiplier *
      planet.priceFluctuator *
      (planet.guild === guildId
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
        (planet.guild === guildId
          ? 1 +
            (1 - gameConstants.guildVendorMultiplier || 1)
          : 1) -
        currentChassisSellPrice,
    ),
    0,
    true,
  )
}

function getGuildChangePrice(ship: {
  planet: PlanetStub | false
  guildId: GuildId
  crewMembers: CrewMemberStub[]
}) {
  if (!ship.guildId) return 0
  if (!ship.planet) return 999999
  return math.r2(
    (ship.crewMembers?.length || 1) *
      3000 *
      ship.planet.priceFluctuator,
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
  // getPlanetDescription,
}
