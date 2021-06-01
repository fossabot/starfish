import species from './species'

const factions: { [key in FactionKey]: BaseFactionData } = {
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
    color: `hsl(190, 75%, 40%)`,
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
    color: `hsl(290, 40%, 50%)`,
    homeworld: `Osiris`,
    species: [
      species.angelfish,
      species.blowfish,
      species.tuna,
      species.shrimp,
    ],
  },
  red: {
    name: `Red Robos`,
    id: `red`,
    color: `hsl(0, 60%, 50%)`,
    ai: true,
    species: [species.robots],
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
