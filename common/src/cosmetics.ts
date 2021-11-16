export const baseShipTaglinePrice = 2
export const baseShipBackgroundPrice = 3

export const baseCrewTaglinePrice = 1000
export const baseCrewBackgroundPrice = 2000

export const buyableShipBackgrounds: {
  rarity: number
  value: ShipBackground
}[] = [
  {
    value: { id: `Vibin'`, url: `jelly1.webp` },
    rarity: 3,
  },
  {
    value: { id: `Big Bertha`, url: `blue2.svg` },
    rarity: 5,
  },
  {
    value: { id: `Pescatarian`, url: `purple2.svg` },
    rarity: 7,
  },
  {
    value: { id: `Tendrils`, url: `jelly2.webp` },
    rarity: 9,
  },
  {
    value: { id: `Grappler`, url: `green2.svg` },
    rarity: 11,
  },
  {
    value: { id: `Planetside`, url: `planetary.webp` },
    rarity: 13,
  },
]

export const buyableShipTaglines: {
  rarity: number
  value: string
}[] = [
  { value: `Very Shallow`, rarity: 2 },
  { value: `Splish Splash`, rarity: 4 },
  { value: `Holy Mackerel!`, rarity: 6 },
  { value: `Flamingo Hunter`, rarity: 8 },
  { value: `Chicken Hunter`, rarity: 9 },
  { value: `Gull Hunter`, rarity: 10 },
  { value: `Eagle Hunter`, rarity: 11 },
  { value: `Small Pond 4 Life`, rarity: 12 },
  { value: `Nautical Nonsense`, rarity: 16 },
  { value: `Whale, I'll Be!`, rarity: 18 },
  { value: `Yarr`, rarity: 20 },
  { value: `Fish 'n' Chips`, rarity: 22 },
  { value: `Gone Fishing`, rarity: 24 },
  { value: `Omega 3 Fatty Acid`, rarity: 26 },
  { value: `Washed Up`, rarity: 28 },
]

export const buyableCrewBackgrounds: {
  rarity: number
  value: CrewBackground
}[] = [
  {
    value: { id: `Ink Splat`, url: `blobs1.svg` },
    rarity: 5,
  },
  {
    value: { id: `Super Star`, url: `star1.svg` },
    rarity: 7,
  },
  {
    value: { id: `Fronds`, url: `blobs2.svg` },
    rarity: 14,
  },
  {
    value: { id: `Supernova`, url: `nebula1.webp` },
    rarity: 10,
  },
  {
    value: { id: `Starfish`, url: `logo.svg` },
    rarity: 13,
  },
  {
    value: { id: `Nebula`, url: `nebula2.webp` },
    rarity: 16,
  },
]

// todo achievements to earn "mining etc specialist" taglines
export const buyableCrewTaglines: {
  rarity: number
  value: string
}[] = [
  { value: `Squirt`, rarity: 3 },
  { value: `Deckhand`, rarity: 4 },
  { value: `Swabbie`, rarity: 5 },
  { value: `Sleepyhead`, rarity: 5 },
  { value: `Nocturnal`, rarity: 7 },
  { value: `Beam Me Up!`, rarity: 9 },
  { value: `Stowaway`, rarity: 10 },
  { value: `Sailor`, rarity: 11 },
  { value: `Aye Aye Cap'n!`, rarity: 13 },
  { value: `Admiral`, rarity: 15 },
  { value: `Captain Hook`, rarity: 17 },
]

export function getShipTaglinePrice(
  cosmetic: PlanetShipCosmetic,
): Price {
  const price: Price = {}
  price.shipCosmeticCurrency = Math.ceil(
    (cosmetic.tagline ? baseShipTaglinePrice : 0) *
      cosmetic.priceMultiplier,
  )
  return price
}
export function getShipBackgroundPrice(
  cosmetic: PlanetShipCosmetic,
): Price {
  const price: Price = {}
  price.shipCosmeticCurrency = Math.ceil(
    (cosmetic.headerBackground
      ? baseShipBackgroundPrice
      : 0) * cosmetic.priceMultiplier,
  )
  return price
}

export function getCrewTaglinePrice(
  cosmetic: PlanetCrewCosmetic,
): Price {
  const price: Price = {}
  price.crewCosmeticCurrency = Math.ceil(
    (cosmetic.tagline ? baseCrewTaglinePrice : 0) *
      cosmetic.priceMultiplier,
  )
  return price
}
export function getCrewBackgroundPrice(
  cosmetic: PlanetCrewCosmetic,
): Price {
  const price: Price = {}
  price.crewCosmeticCurrency = Math.ceil(
    (cosmetic.background ? baseCrewBackgroundPrice : 0) *
      cosmetic.priceMultiplier,
  )
  return price
}
