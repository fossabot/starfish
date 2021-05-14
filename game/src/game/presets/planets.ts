import { food, metals, textiles } from './cargo'

const planets: BasePlanetData[] = []

planets.push({
  name: `Origin`,
  color: `green`,
  location: [0, 0],
  vendor: {
    cargo: [
      {
        cargoData: food,
        buyMultiplier: 1,
        sellMultiplier: 1,
      },
      {
        cargoData: metals,
        buyMultiplier: 1,
        sellMultiplier: 1,
      },
      {
        cargoData: textiles,
        buyMultiplier: 1,
        sellMultiplier: 1,
      },
    ],
  },
})

planets.push({
  name: `Hera`,
  color: `red`,
  location: [-1, 0],
  vendor: {
    cargo: [
      {
        cargoData: food,
        buyMultiplier: 1.2,
        sellMultiplier: 0.8,
      },
      {
        cargoData: metals,
        buyMultiplier: 0.8,
        sellMultiplier: 1.2,
      },
      {
        cargoData: textiles,
        buyMultiplier: 1.1,
        sellMultiplier: 0.9,
      },
    ],
  },
})

export default planets
