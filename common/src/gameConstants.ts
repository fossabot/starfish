const gameSpeedMultiplier = 10

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
const planetLevelXpRequirementMultiplier = 10

const attackRemnantExpireTime =
  (1000 * 60 * 60 * 24 * 7) / gameSpeedMultiplier
const cacheExpireTime =
  (1000 * 60 * 60 * 24 * 7 * 15) / gameSpeedMultiplier

const supportServerLink = `https://discord.gg/aEKE3bFR6n`

const userIsOfflineTimeout = 1000 * 60 * 60

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
  guild: (keyof BaseGuildData)[]
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
  guild: [`aiOnly`, `name`, `id`, `color`],
  species: [`id`, `singular`, `icon`],
  chassis: [`displayName`],
}
const sameGuildShipScanProperties = {
  _hp: true,
  _maxHp: true,
}

const tactics: CombatTactic[] = [
  `aggressive`,
  `defensive`,
  `pacifist`,
]

const baseCargoSellMultiplier = 0.3

const taglineOptions: string[] = [
  `Alpha Tester`, // implemented
  `Tester`,
  `✨Supporter✨`,
  `⚡Admin⚡`, // implemented

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

  // sleep time
  `Bottom Feeder`,

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
  { id: `Blue Guild 1`, url: `blue1.svg` }, // finish tutorial
  { id: `Purple Guild 1`, url: `purple1.svg` }, // finish tutorial
  { id: `Green Guild 1`, url: `green1.svg` }, // finish tutorial
  { id: `Blue Guild 2`, url: `blue2.svg` }, // finish tutorial
  { id: `Purple Guild 2`, url: `purple2.svg` }, // finish tutorial
  { id: `Green Guild 2`, url: `green2.svg` }, // finish tutorial
  { id: `Flat 1`, url: `flat1.svg` }, // equipping items
  { id: `Flat 2`, url: `flat2.svg` }, // equipping items
  { id: `Stone Cold 1`, url: `gradient1.svg` }, // killing an enemy
  { id: `Crimson Blur`, url: `gradient2.svg` }, // high speed
  { id: `Lightspeedy`, url: `gradient3.svg` }, // breaking lightspeed
  { id: `Constellation 1`, url: `stars1.jpg` }, // discover planets
  { id: `Gravestone 1`, url: `vintage1.jpg` }, // die twice
]

export default {
  supportServerLink,
  gameSpeedMultiplier,
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
  taglineOptions,
  headerBackgroundOptions,
}
