import c from '../../../../common/dist'
import type { Faction } from '../classes/Faction'
import type { Planet } from '../classes/Planet'
import type { Game } from '../Game'
import factions from './factions'
import { data as passiveData } from './crewPassives'
import { data as cargoData } from './cargo'
import * as itemData from './items'
import type { Ship } from '../classes/Ship/Ship'

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
  const isTooClose = (p: Planet | Ship) =>
    c.distance(location, p.location) < tooClose
  while (
    game.planets.find(isTooClose) ||
    game.humanShips.find(isTooClose)
  ) {
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
      const { buyMultiplier, sellMultiplier } =
        getBuyAndSellMultipliers()
      vendor.cargo.push({
        cargoType: d.type,
        buyMultiplier,
        sellMultiplier,
      })
    }
  }
  for (let d of Object.values(passiveData)) {
    if (d.rarity > maxRarity || d.rarity < minRarity)
      continue
    if (Math.random() > passiveDispropensity) {
      const { buyMultiplier, sellMultiplier } =
        getBuyAndSellMultipliers()
      vendor.passives.push({
        passiveType: d.type,
        buyMultiplier,
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
    const { buyMultiplier, sellMultiplier } =
      getBuyAndSellMultipliers(true)
    // vendors will buy any item, but only sell a few
    const itemForSale: VendorItemPrice = {
      itemType: d.type,
      itemId: d.id,
      sellMultiplier,
    }
    if (
      d.rarity < maxRarity &&
      d.rarity > minRarity &&
      Math.random() > itemDispropensity
    )
      itemForSale.buyMultiplier = buyMultiplier
    vendor.items.push(itemForSale)
  }
  for (let d of Object.values(itemData.chassis)) {
    if (d.rarity > maxRarity || d.rarity < minRarity)
      continue
    if (Math.random() > chassisDispropensity) {
      const { buyMultiplier, sellMultiplier } =
        getBuyAndSellMultipliers()
      vendor.chassis.push({
        chassisType: d.id,
        buyMultiplier,
        sellMultiplier,
      })
    }
  }

  const creatures: string[] = []
  while (creatures.length === 0 || Math.random() > 0.5) {
    const viableCreatures = factionId
      ? seaCreatures.filter(
          (s) => s.factionKey === factionId,
        )
      : seaCreatures
    const chosen = c.randomFromArray(viableCreatures)
    if (!creatures.find((cre) => cre === chosen))
      creatures.push(chosen.name)
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

function getBuyAndSellMultipliers(item: boolean = false) {
  const buyMultiplier = c.r2(0.8 + Math.random() * 0.4, 3)
  const sellMultiplier =
    Math.min(
      buyMultiplier * c.factionVendorMultiplier,
      c.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3),
    ) * (item ? 0.4 : 1)
  return { buyMultiplier, sellMultiplier }
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

const seaCreatures: {
  name: string
  factionKey: FactionKey
}[] = [
  { name: `crabs`, factionKey: `green` },
  { name: `oysters`, factionKey: `green` },
  { name: `clams`, factionKey: `green` },
  { name: `abalones`, factionKey: `green` },
  { name: `barnacles`, factionKey: `green` },
  { name: `octopi`, factionKey: `green` },
  { name: `squids`, factionKey: `green` },
  { name: `lobsters`, factionKey: `green` },
  { name: `anemones`, factionKey: `green` },
  { name: `jellyfish`, factionKey: `green` },
  { name: `urchins`, factionKey: `green` },

  { name: `sharks`, factionKey: `purple` },
  { name: `seahorses`, factionKey: `purple` },
  { name: `starfish`, factionKey: `purple` },
  { name: `anglerfish`, factionKey: `purple` },
  { name: `eels`, factionKey: `purple` },
  { name: `shrimp`, factionKey: `purple` },
  { name: `corals`, factionKey: `purple` },
  { name: `narwhals`, factionKey: `purple` },
  { name: `cod`, factionKey: `purple` },
  { name: `mackerel`, factionKey: `purple` },
  { name: `tuna`, factionKey: `purple` },
  { name: `marlin`, factionKey: `purple` },
  { name: `swordfish`, factionKey: `purple` },
  { name: `angelfish`, factionKey: `purple` },
  { name: `clownfish`, factionKey: `purple` },

  { name: `walruses`, factionKey: `blue` },
  { name: `whales`, factionKey: `blue` },
  { name: `orcas`, factionKey: `blue` },
  { name: `seals`, factionKey: `blue` },
  { name: `blowfish`, factionKey: `blue` },
  { name: `penguins`, factionKey: `blue` },
  { name: `seagulls`, factionKey: `blue` },
  { name: `dolphins`, factionKey: `blue` },
  { name: `sea otters`, factionKey: `blue` },
  { name: `pelicans`, factionKey: `blue` },
  { name: `sea turtles`, factionKey: `blue` },
  { name: `sea lions`, factionKey: `blue` },
]
