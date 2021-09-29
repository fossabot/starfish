import species from './species'
const factions: { [key in FactionId]: BaseFactionData } = {
  green: {
    name: `Green Grapplers`,
    id: `green`,
    color: `hsl(140, 70%, 55%)`,
    homeworld: `Origin`,
    species: [
      species.octopi,
      species.squids,
      species.crabs,
      species.lobsters,
    ],
  },
  blue: {
    name: `Blue Breathers`,
    id: `blue`,
    color: `hsl(190, 80%, 45%)`,
    homeworld: `Neptune`,
    species: [
      species.seals,
      species[`sea turtles`],
      species.dolphins,
      species.whales,
    ],
  },
  purple: {
    name: `Purple Pescos`,
    id: `purple`,
    color: `hsl(290, 50%, 55%)`,
    homeworld: `Osiris`,
    species: [
      species.angelfish,
      species.blowfish,
      species.tuna,
      species.shrimp,
    ],
  },
  red: {
    name: `Bloody Birds`,
    id: `red`,
    color: `hsl(0, 60%, 50%)`,
    ai: true,
    species: [
      species.seagulls,
      species.flamingos,
      species.eagles,
      species.chickens,
    ],
  },
}

// proper fish 🐟🐠🐡
// air breathers 🦭🐢🦈🐋
// bottom feeders 🦞🦀(🦪)
// wigglers 🐙🦑🦐

// green grapplers 🐙🦑🦞🦀
// blue breathers 🦭🐢🦈🐋
// purple pescos 🐟🐠🐡🦐
// annnd red robos lmao

// salt-water
// freshwater
// air-breathers

export default factions
