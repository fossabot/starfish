import math from './math'
import globals from './globals'
import c from './log'
import * as cargo from './cargo'
import text from './text'
import { Profiler } from './Profiler'

const gameShipLimit = 100

const gameSpeedMultiplier = 10

const baseSightRange = 0.05
const baseBroadcastRange = 0.002

const baseRepairCost = 1000

const maxBroadcastLength = 200

const baseStaminaUse = 0.00001 * gameSpeedMultiplier

const baseXpGain = 0.05 * gameSpeedMultiplier

const itemPriceMultiplier = 1

const factionVendorMultiplier = 0.98
const factionAllegianceFriendCutoff = 50

const baseItemSellMultiplier = 0.6

const noEngineThrustMagnitude = 0.02

const aiDifficultyMultiplier = 0.5

const planetContributeCostPerXp = 10

const attackRemnantExpireTime =
  (1000 * 60 * 60 * 24 * 7) / gameSpeedMultiplier
const cacheExpireTime =
  (1000 * 60 * 60 * 24 * 7 * 10) / gameSpeedMultiplier

const supportServerLink = `https://discord.gg/aEKE3bFR6n`

const baseShipScanProperties: {
  id: true
  name: true
  human: true
  ai: true
  headerBackground: true
  tagline: true
  level: true
  dead: true
  attackable: true
  previousLocations: true
  location: true
  planet: (keyof BasePlanetData)[]
  faction: (keyof BaseFactionData)[]
  species: (keyof BaseSpeciesData)[]
  chassis: (keyof BaseChassisData)[]
} = {
  id: true,
  name: true,
  human: true,
  ai: true,
  headerBackground: true,
  tagline: true,
  level: true,
  dead: true,
  attackable: true,
  previousLocations: true,
  location: true,
  planet: [`name`, `location`],
  faction: [`ai`, `name`, `id`, `color`],
  species: [`id`, `singular`, `icon`],
  chassis: [`displayName`],
}
const sameFactionShipScanProperties = {
  _hp: true,
  _maxHp: true,
}

const tactics: Tactic[] = [`aggressive`, `defensive`]

function getHitDamage(
  weapon: WeaponStub,
  totalMunitionsSkill: number = 0,
) {
  return (
    weapon.damage *
    (1 + (totalMunitionsSkill - 1) / 50) *
    (weapon.repair || 0)
  )
}

function getBaseDurabilityLossPerTick(
  maxHp: number,
  reliability: number,
) {
  return (
    (0.00001 * gameSpeedMultiplier * (10 / maxHp)) /
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
    ) * gameSpeedMultiplier
  )
}

const baseEngineThrustMultiplier = gameSpeedMultiplier * 0.1

function getThrustMagnitudeForSingleCrewMember(
  level: number = 1,
  engineThrustMultiplier: number = 1,
): number {
  const min: number = 1
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
  return (
    (math.lerp(0.1, 0.3, level / 100) /
      globals.tickInterval) *
    gameSpeedMultiplier
  )
}

function getMineAmountPerTickForSingleCrewMember(
  level: number,
) {
  return (
    (math.lerp(30, 100, level / 100) /
      globals.tickInterval) *
    gameSpeedMultiplier
  )
}

function getStaminaGainPerTickForSingleCrewMember() {
  return baseStaminaUse * 1.5
}

function getWeaponCooldownReductionPerTick(level: number) {
  return (
    (2 + math.lerp(1, 20, level / 100)) *
    3 *
    gameSpeedMultiplier
  )
}

function getCrewPassivePriceMultiplier(level: number) {
  return 1 + level ** 2
}

const baseCargoSellMultiplier = 0.3

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

const taglineOptions: string[] = [
  `Tester`,
  `✨Supporter✨`,
  `🔨Admin🔨`,

  // to be assigned
  `Big Flipper`,
  `Whale, I'll be!`,
  `Splish Splash`,
  `Holy Mackerel!`,
  `Small Pond 4 Life`,
  `Nautical Nonsense`,
  `Very Shallow`,

  // flight (implemented)
  `River Runner`,
  `Hell's Angelfish`,
  `Flying Fish`,
  // todo more flight taglines for distance traveled

  // exploration (implemented)
  `Small Pond Paddler`,
  `Current Rider`,
  `Migratory`,
  `EAC-zy Rider`,

  // credits (implemented)
  `Easy Target`,
  `Moneybags`,

  // bunk (implemented)
  `Nap Champions`,

  // upgrade to x chassis
  `Big Kahuna`,

  // planet time
  `Home Schooled`,

  // combat achievements
  `Nibbler`,
  `On the Hunt`,
  `Blood in the Water`,
  `Feeding Frenzied`,
  `Venomous`,
  `Big Chompers`,
  `Bait and Switch`,

  // dying (implemented)
  `Delicious with Lemon`,

  // crew member numbers (implemented)
  `Guppy`,
  `Schoolin'`,
  `Pod`,
  `Big Fish`,
]

const headerBackgroundOptions: {
  id: string
  url: string
}[] = [
  { id: `Default`, url: `default.jpg` }, // auto
  { id: `Blue Faction 1`, url: `blue1.svg` }, // finish tutorial
  { id: `Purple Faction 1`, url: `purple1.svg` }, // finish tutorial
  { id: `Green Faction 1`, url: `green1.svg` }, // finish tutorial
  // { id: `Blue Faction 2`, url: `blue2.svg` }, // ! no image yet
  // { id: `Purple Faction 2`, url: `purple2.svg` }, // ! no image yet
  // { id: `Green Faction 2`, url: `green2.svg` }, // ! no image yet
  { id: `Flat 1`, url: `flat1.svg` }, // equipping items
  { id: `Flat 2`, url: `flat2.svg` }, // equipping items
  { id: `Stone Cold 1`, url: `gradient1.svg` }, // killing an enemy
  { id: `Crimson Blur`, url: `gradient2.svg` }, // high speed
  { id: `Lightspeedy`, url: `gradient3.svg` }, // breaking lightspeed
  { id: `Constellation 1`, url: `stars1.jpg` }, // discover planets
  { id: `Gravestone 1`, url: `vintage1.jpg` }, // die twice
]

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
      `Dockyard`,
      `Landing`,
      `Spaceport`,
      `Trade Hub`,
      `Ecosystem`,
      `Metropolis`,
      `Megalopolis`,
      `Sector Hub`,
      `Stellar Waypoint`,
      `Galactic Nucleus`,
    ]

  return names[Math.floor(planet.level - 1)] || `Domain`
  // todo finish
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

function stubify<BaseType, StubType extends BaseStub>(
  baseObject: BaseType,
  disallowPropName: string[] = [],
  disallowRecursion: boolean = false,
): StubType {
  const profiler = new Profiler(10, `stubify`, false, 0)
  profiler.step(`getters`)
  const gettersIncluded: any = { ...baseObject }
  const proto = Object.getPrototypeOf(baseObject)
  const getKeyValue =
    (key: string) => (obj: Record<string, any>) =>
      obj[key]
  // c.log(Object.getOwnPropertyNames(proto))
  for (const key of Object.getOwnPropertyNames(proto)) {
    const desc = Object.getOwnPropertyDescriptor(proto, key)
    const hasGetter = desc && typeof desc.get === `function`
    if (hasGetter) {
      gettersIncluded[key] = getKeyValue(key)(baseObject)
    }
  }
  profiler.step(`stringify and parse`)
  // c.log(Object.keys(gettersIncluded))
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(
      gettersIncluded,
      (key: string, value: any) => {
        if ([`toUpdate`, `_stub`, `_id`].includes(key))
          return undefined
        if (
          [
            `game`,
            `ship`,
            `attacker`,
            `defender`,
            `crewMember`,
            `homeworld`,
            `faction`,
            `species`,
          ].includes(key)
        )
          return value?.id ? { id: value.id } : null
        if (disallowPropName?.includes(key))
          return value?.id || undefined
        if ([`ships`].includes(key) && Array.isArray(value))
          return value.map((v) =>
            stubify(v, [
              `visible`,
              `seenPlanets`,
              `seenLandmarks`,
              `enemiesInAttackRange`,
            ]),
          )
        // if (!disallowRecursion && value && value.stubify) {
        //   c.log(
        //     value.type,
        //     value.id,
        //     // Object.keys(value).filter(
        //     //   (v) =>
        //     //     ![
        //     //       `game`,
        //     //       `ship`,
        //     //       `attacker`,
        //     //       `defender`,
        //     //       `crewMember`,
        //     //       `homeworld`,
        //     //     ].includes(v),
        //     // ),
        //   )
        //   return value.stubify([key], true)
        // } else if (value && value.stubify) return value.id
        return value
      },
    ),
  ) as StubType
  // circularReferencesRemoved.lastUpdated = Date.now()
  profiler.end()
  return circularReferencesRemoved
}

export default {
  supportServerLink,
  gameShipLimit,
  gameSpeedMultiplier,
  baseSightRange,
  baseBroadcastRange,
  baseRepairCost,
  maxBroadcastLength,
  baseStaminaUse,
  baseXpGain,
  factionVendorMultiplier,
  factionAllegianceFriendCutoff,
  itemPriceMultiplier,
  baseItemSellMultiplier,
  noEngineThrustMagnitude,
  aiDifficultyMultiplier,
  planetContributeCostPerXp,
  attackRemnantExpireTime,
  cacheExpireTime,
  baseShipScanProperties,
  sameFactionShipScanProperties,
  getHitDamage,
  getBaseDurabilityLossPerTick,
  getRadiusDiminishingReturns,
  getRepairAmountPerTickForSingleCrewMember,
  getMineAmountPerTickForSingleCrewMember,
  getMaxCockpitChargeForSingleCrewMember,
  getCockpitChargePerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  baseEngineThrustMultiplier,
  getStaminaGainPerTickForSingleCrewMember,
  getWeaponCooldownReductionPerTick,
  getCrewPassivePriceMultiplier,
  tactics,
  baseCargoSellMultiplier,
  taglineOptions,
  statToString,
  headerBackgroundOptions,
  getPlanetTitle,
  getPlanetPopulation,
  // getPlanetDescription,
  stubify,
}
