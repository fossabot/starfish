const baseCurrencySingular = `speso`
const baseCurrencyPlural = `spesos`

const shipSpecialCurrencySingular = `shipSpecialCurrencySingular`
const shipSpecialCurrencyPlural = `shipSpecialCurrencyPlural`

const crewSpecialCurrencySingular = `crewSpecialCurrencySingular`
const crewSpecialCurrencyPlural = `crewSpecialCurrencyPlural`

const baseSightRange = 0.05
const baseBroadcastRange = 0.002

const baseRepairCost = 600

const maxBroadcastLength = 200

const defaultHomeworldLevel = 12

const itemPriceMultiplier = 400
const weaponDamageMultiplier = 1

const guildVendorMultiplier = 0.98
const guildAllegianceFriendCutoff = 50

const baseItemSellMultiplier = 0.6

const noEngineThrustMagnitude = 0.02

const planetContributeCostPerXp = 1
const planetLevelXpRequirementMultiplier = 15

const attackRemnantExpireTime = 1000 * 60 * 60 * 24 * 0.35
const cacheExpireTime = 1000 * 60 * 60 * 24 * 7 * 1.5

const supportServerLink = `https://discord.gg/aEKE3bFR6n`

const userIsOfflineTimeout = 1000 * 60 * 60

const baseShipScanProperties: {
  id: true
  name: true
  human: true
  ai: true
  guildId: true
  headerBackground: true
  tagline: true
  level: true
  dead: true
  attackable: true
  previousLocations: true
  location: true
  planet: (keyof BasePlanetData)[]
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
  guildId: true,
  chassis: [`displayName`],
}
const sameGuildShipScanProperties = {
  _hp: true,
  _maxHp: true,
}

const tactics: CombatTactic[] = [
  `aggressive`,
  `defensive`,
  `onlyNonPlayers`,
  `onlyPlayers`,
  `pacifist`,
]

const baseCargoSellMultiplier = 0.3

export default {
  baseCurrencySingular,
  baseCurrencyPlural,
  shipSpecialCurrencySingular,
  shipSpecialCurrencyPlural,
  crewSpecialCurrencySingular,
  crewSpecialCurrencyPlural,

  supportServerLink,
  baseSightRange,
  baseBroadcastRange,
  baseRepairCost,
  defaultHomeworldLevel,
  maxBroadcastLength,
  guildVendorMultiplier,
  guildAllegianceFriendCutoff,
  userIsOfflineTimeout,
  baseItemSellMultiplier,
  noEngineThrustMagnitude,
  planetContributeCostPerXp,
  planetLevelXpRequirementMultiplier,
  itemPriceMultiplier,
  weaponDamageMultiplier,
  attackRemnantExpireTime,
  cacheExpireTime,
  baseShipScanProperties,
  sameGuildShipScanProperties,
  tactics,
  baseCargoSellMultiplier,
}
