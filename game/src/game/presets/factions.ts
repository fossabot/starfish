import c from '../../../../common/dist'
const factions: { [key in FactionKey]: BaseFactionData } = {
  green: {
    name: `Green Grapplers`,
    id: `green`,
    color: `hsl(140, 70%, 55%)`,
    homeworld: `Origin`,
    species: [
      c.species.octopi,
      c.species.squids,
      c.species.crabs,
      c.species.lobsters,
    ],
  },
  blue: {
    name: `Blue Breathers`,
    id: `blue`,
    color: `hsl(190, 75%, 40%)`,
    homeworld: `Neptune`,
    species: [
      c.species.seals,
      c.species[`sea turtles`],
      c.species.dolphins,
      c.species.whales,
    ],
  },
  purple: {
    name: `Purple Pescos`,
    id: `purple`,
    color: `hsl(290, 40%, 50%)`,
    homeworld: `Osiris`,
    species: [
      c.species.angelfish,
      c.species.blowfish,
      c.species.tuna,
      c.species.shrimp,
    ],
  },
  red: {
    name: `Bloody Birds`,
    id: `red`,
    color: `hsl(0, 60%, 50%)`,
    ai: true,
    species: [
      c.species.seagulls,
      c.species.flamingos,
      c.species.eagles,
      c.species.chickens,
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
