import c from '../../../../common/dist'
import type { Faction } from '../classes/Faction'
import type { Planet } from '../classes/Planet'
import type { Game } from '../Game'
import factions from './factions'
import { data as passiveData } from './crewPassives'
import { data as cargoData } from './cargo'
import * as itemData from './items'

export function generatePlanet(
  game: Game,
  homeworldFactionKey?: FactionKey,
): BasePlanetData | false {
  let name: string | undefined
  const possibleNames = [...planetNames]
  while (!name && possibleNames.length) {
    const chosenIndex = Math.floor(
      Math.random() * possibleNames.length,
    )
    let thisName: string | undefined =
      possibleNames[chosenIndex]
    possibleNames.splice(chosenIndex, 1)
    if (
      thisName &&
      game.planets.find((p) => p.name === thisName)
    )
      thisName = undefined
    name = thisName
  }
  if (!name) return false

  let locationSearchRadius = game.gameSoftRadius * 0.75
  const tooClose = 0.1
  let location: CoordinatePair = [0, 0]
  const isTooClose = (p: Planet) =>
    c.distance(location, p.location) < tooClose
  while (game.planets.find(isTooClose)) {
    location = c.randomInsideCircle(locationSearchRadius)
    locationSearchRadius *= 1.01
  }

  const radius = Math.floor(Math.random() * 60000 + 10000)

  let factionId: FactionKey | undefined
  if (homeworldFactionKey) factionId = homeworldFactionKey
  else {
    if (Math.random() > 0.6)
      factionId = c.randomFromArray(Object.keys(factions))
    if (factionId === `red`) factionId = undefined
  }

  const color = factionId
    ? factions[factionId].color
    : `hsl(${Math.random() * 360}, ${Math.round(
        Math.random() * 80 + 20,
      )}%, ${Math.round(Math.random() * 40) + 30}%)`

  const repairCostMultiplier = c.r2(
    1 + Math.random() * 0.2 - 0.1,
    3,
  )

  const vendor: Vendor = {
    cargo: [],
    passives: [],
    actives: [],
    items: [],
    chassis: [],
  }
  const level = c.distance([0, 0], location)
  const maxRarity = level
  const minRarity = level / 4
  const cargoDispropensity = 0.8 - Math.random()
  const passiveDispropensity = 1 - Math.random() / 2
  const itemDispropensity = 1 - Math.random() / 2
  const chassisDispropensity = 1 - Math.random() / 2
  for (let d of Object.values(cargoData)) {
    if (d.rarity > maxRarity) continue
    if (Math.random() > cargoDispropensity) {
      const bm = c.r2(0.8 + Math.random() * 0.4, 3)
      const sm = c.r2(bm * (Math.random() * 0.2) + 0.55, 3)
      vendor.cargo.push({
        cargoType: d.type,
        buyMultiplier: bm,
        sellMultiplier: sm,
      })
    }
  }
  for (let d of Object.values(passiveData)) {
    if (d.rarity > maxRarity || d.rarity < minRarity)
      continue
    if (Math.random() > passiveDispropensity) {
      const bm = c.r2(0.8 + Math.random() * 0.4, 3)
      vendor.passives.push({
        passiveType: d.type,
        buyMultiplier: bm,
      })
    }
  }
  for (let d of [
    ...Object.values(itemData.armor),
    ...Object.values(itemData.engine),
    ...Object.values(itemData.weapon),
    ...Object.values(itemData.scanner),
    ...Object.values(itemData.communicator),
  ]) {
    const bm = c.r2(0.8 + Math.random() * 0.4, 3)
    const sm = c.r2(bm * (Math.random() * 0.2) + 0.55, 3)
    // vendors will buy any item, but only sell a few
    const itemForSale: VendorItemPrice = {
      itemType: d.type,
      itemId: d.id,
      sellMultiplier: sm,
    }
    if (
      d.rarity < maxRarity &&
      d.rarity > minRarity &&
      Math.random() > itemDispropensity
    )
      itemForSale.buyMultiplier = bm
    vendor.items.push(itemForSale)
  }
  for (let d of Object.values(itemData.chassis)) {
    if (d.rarity > maxRarity || d.rarity < minRarity)
      continue
    if (Math.random() > chassisDispropensity) {
      const bm = c.r2(0.8 + Math.random() * 0.4, 3)
      const sm = c.r2(bm * (Math.random() * 0.2) + 0.55, 3)
      vendor.chassis.push({
        chassisType: d.id,
        buyMultiplier: bm,
        sellMultiplier: sm,
      })
    }
  }

  // todo these correspond generally to faction
  const creatures: string[] = []
  while (creatures.length === 0 || Math.random() > 0.5) {
    const chosen = c.randomFromArray(seaCreatures)
    if (!creatures.find((cre) => cre === chosen))
      creatures.push(chosen)
  }

  return {
    name,
    color,
    creatures,
    factionId,
    homeworld: homeworldFactionKey
      ? { id: homeworldFactionKey }
      : undefined,
    radius,
    location,
    vendor,
    repairCostMultiplier,
  }
}

const planetNames = [
  `Osiris`,
  `Neptune`,
  `Cancer`,
  `Lapis`,
  `Lazuli`,
  `Senara`,
  `Pethea`,
  `Mara`,
  `Trinda`,
  `Raitis`,
  `Chanus`,
  `Siunia`,
  `Bion`,
  `Zonoe`,
  `Zeon`,
  `Lyria`,
  `Churia`,
  `Ozuno`,
  `Deron`,
  `Melion`,
  `Norix`,
  `Aqua`,
  `Solio`,
  `Kogars`,
  `Yaria`,
  `Bolla`,
  `Io`,
  `Artemis`,
  `Hera`,
  `Exodus`,
  `Bonia`,
  `Phides`,
  `Auster`,
  `Sirius`,
  `Alpha`,
  `Beta`,
  `Omega`,
  `Kappa`,
  `Zeta`,
  `Delta`,
  `Cronus`,
  `Adonis`,
  `Lethe`,
  `Circe`,
  `Thrace`,
  `Pluto`,
  `Achilles`,
  `Hermes`,
  `Zenra`,
  // todo MORE
]

const seaCreatures = [
  `crabs`,
  `seals`,
  `octopi`,
  `squids`,
  `sharks`,
  `seahorses`,
  `walruses`,
  `starfish`,
  `whales`,
  `orcas`,
  `anglerfish`,
  `eels`,
  `blowfish`,
  `penguins`,
  `jellyfish`,
  `squids`,
  `lobsters`,
  `shrimp`,
  `oysters`,
  `clams`,
  `abalones`,
  `barnacles`,
  `seagulls`,
  `dolphins`,
  `urchins`,
  `sea otters`,
  `pelicans`,
  `anemones`,
  `sea turtles`,
  `sea lions`,
  `corals`,
  `narwhals`,
  `cod`,
  `mackerel`,
  `tuna`,
  `marlin`,
  `swordfish`,
  `angelfish`,
  `clownfish`,
]

// const planets: BasePlanetData[] = [
//   {
//     name: `Cancer`,
//     location: [0, 0],
//     color: `hsl(50, 80%, 60%)`,
//     radius: 56000,
//     factionId,
//     creatures: [`crabs`],
//     repairCostMultiplier: 1,
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: water,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: oxygen,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//       ],
//       passives: [
//         {
//           passiveData: passiveData.cargoSpace,
//           buyMultiplier: 1.2,
//         },
//       ],
//     },
//   },
//   {
//     name: `Hera`,
//     color: `red`,
//     location: [-1, 0],
//     radius: 26000,
//     creatures: [`lobsters`],
//     repairCostMultiplier: 1.1,
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 1.2,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: water,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.55,
//         },
//         {
//           cargoData: oxygen,
//           buyMultiplier: 1.1,
//           sellMultiplier: 0.9,
//         },
//       ],
//     },
//   },
//   {
//     name: `Osiris`,
//     color: `hsl(240, 80%, 90%)`,
//     location: [0.2, -0.1],
//     radius: 36000,
//     creatures: [`tuna`, `blowfish`],
//     vendor: {
//       cargo: [
//         {
//           cargoData: oxygen,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.4,
//         },
//       ],
//     },
//   },
//   {
//     name: `Neptune`,
//     color: `hsl(240, 80%, 90%)`,
//     location: [-0.15, 0.28],
//     radius: 36000,
//     creatures: [`narwhals`, `beluga whales`],
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.4,
//         },
//       ],
//     },
//   },
// ]

// export default planets
