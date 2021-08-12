import math from './math'
import globals from './globals'
import c from './log'
import { Profiler } from './Profiler'

const gameShipLimit = 100

const gameSpeedMultiplier = 1 * 12

const baseSightRange = 0.05

const baseRepairCost = 3000

const maxBroadcastLength = 200

const baseStaminaUse = 0.00001 * gameSpeedMultiplier

const baseXpGain = 0.05 * gameSpeedMultiplier

const itemPriceMultiplier = 1

const factionVendorMultiplier = 0.98
const factionAllegianceFriendCutoff = 50

const baseItemSellMultiplier = 0.75

const noEngineThrustMagnitude = 0.02

const aiDifficultyMultiplier = 0.5

const attackRemnantExpireTime =
  (1000 * 60 * 60 * 24 * 3) / gameSpeedMultiplier
const cacheExpireTime =
  (1000 * 60 * 60 * 24 * 14) / gameSpeedMultiplier

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
const cargoTypes: (`credits` | CargoType)[] = [
  `salt`,
  `water`,
  `oxygen`,
  `credits`,
]

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
  return math.lerp(1, 5, (level - 1) / 100)
}

function getCockpitChargePerTickForSingleCrewMember(
  level: number = 1,
) {
  const flatMod = 0.6
  return math.lerp(
    0.002 * flatMod,
    0.0005 * flatMod,
    level / 100,
  ) // backwards because you gain max charge
}

function getThrustMagnitudeForSingleCrewMember(
  level: number = 1,
  engineThrustMultiplier: number = 1,
): number {
  return (
    math.lerp(0.2, 1, level / 100) *
    engineThrustMultiplier *
    gameSpeedMultiplier
  )
}

function getRepairAmountPerTickForSingleCrewMember(
  level: number,
) {
  return (
    (math.lerp(0.15, 1.0, level / 100) /
      globals.TICK_INTERVAL) *
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

function stubify<BaseType, StubType extends BaseStub>(
  prop: BaseType,
  disallowPropName?: string[],
): StubType {
  const profiler = new Profiler(10, `stubify`, false, 0)
  profiler.step(`getters`)
  const gettersIncluded: any = { ...prop }
  const proto = Object.getPrototypeOf(prop)
  const getKeyValue =
    (key: string) => (obj: Record<string, any>) =>
      obj[key]
  // c.log(Object.getOwnPropertyNames(proto))
  for (const key of Object.getOwnPropertyNames(proto)) {
    const desc = Object.getOwnPropertyDescriptor(proto, key)
    const hasGetter = desc && typeof desc.get === `function`
    if (hasGetter) {
      gettersIncluded[key] = getKeyValue(key)(prop)
    }
  }
  profiler.step(`stringify and parse`)
  const circularReferencesRemoved = JSON.parse(
    JSON.stringify(
      gettersIncluded,
      (key: string, value: any) => {
        if ([`toUpdate`, `_stub`].includes(key)) return
        if (
          [
            `game`,
            `ship`,
            `attacker`,
            `defender`,
            `crewMember`,
            `homeworld`,
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
              `enemiesInAttackRange`,
            ]),
          )
        return value
      },
    ),
  ) as StubType
  // circularReferencesRemoved.lastUpdated = Date.now()
  profiler.end()
  return circularReferencesRemoved
}

export default {
  gameShipLimit,
  gameSpeedMultiplier,
  baseSightRange,
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
  attackRemnantExpireTime,
  cacheExpireTime,
  baseShipScanProperties,
  sameFactionShipScanProperties,
  getHitDamage,
  getBaseDurabilityLossPerTick,
  getRadiusDiminishingReturns,
  getRepairAmountPerTickForSingleCrewMember,
  getMaxCockpitChargeForSingleCrewMember,
  getCockpitChargePerTickForSingleCrewMember,
  getThrustMagnitudeForSingleCrewMember,
  getStaminaGainPerTickForSingleCrewMember,
  getWeaponCooldownReductionPerTick,
  getCrewPassivePriceMultiplier,
  tactics,
  cargoTypes,
  taglineOptions,
  headerBackgroundOptions,
  stubify,
}
