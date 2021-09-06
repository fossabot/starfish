import game from '../game'

// todo make brake-specialized engines
/*
{
  id: `boostBrake`,
  intensity: 0.4,
},
*/

export const engines: {
  [key in EngineId]: BaseEngineData
} = {
  tutorial1: {
    buyable: false,
    type: `engine`,
    id: `tutorial1`,
    displayName: `Bubble Booster v1`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
    mass: 4000,
    basePrice: 0 * game.itemPriceMultiplier,
    rarity: 999999,
    thrustAmplification: 3,
    maxHp: 10,
    passives: [],
  },
  starter1: {
    type: `engine`,
    id: `starter1`,
    displayName: `Bubble Booster v1`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
    mass: 4000,
    basePrice: 17000 * game.itemPriceMultiplier,
    rarity: 0.4,
    thrustAmplification: 0.7,
    maxHp: 5,
    passives: [],
  },
  starter2: {
    type: `engine`,
    id: `starter2`,
    displayName: `Bubble Booster v2`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.Version two slightly improves upon the chemical formula used in the fuel.`,
    mass: 3900,
    basePrice: 45000 * game.itemPriceMultiplier,
    rarity: 2,
    thrustAmplification: 0.9,
    maxHp: 6,
    passives: [],
  },

  // basic
  basic1: {
    type: `engine`,
    id: `basic1`,
    displayName: `Tail Thruster 100`,
    description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
    mass: 5000,
    basePrice: 80000 * game.itemPriceMultiplier,
    rarity: 3,
    thrustAmplification: 1.2,
    maxHp: 4,
    passives: [],
  },
  basic2: {
    type: `engine`,
    id: `basic2`,
    displayName: `Tail Thruster 200`,
    description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
    mass: 5000,
    basePrice: 250000 * game.itemPriceMultiplier,
    rarity: 6,
    thrustAmplification: 1.4,
    maxHp: 4,
    passives: [],
  },

  // glass
  glass1: {
    type: `engine`,
    id: `glass1`,
    displayName: `Gossamer Fin mk.1`,
    description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 300,
    basePrice: 210000 * game.itemPriceMultiplier,
    rarity: 5,
    thrustAmplification: 1.7,
    reliability: 0.3,
    maxHp: 1,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.03 },
    ],
  },
  glass2: {
    type: `engine`,
    id: `glass2`,
    displayName: `Gossamer Fin mk.2`,
    description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 300,
    basePrice: 390000 * game.itemPriceMultiplier,
    rarity: 9,
    thrustAmplification: 2,
    reliability: 0.4,
    maxHp: 1,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.06 },
    ],
  },
  glass3: {
    type: `engine`,
    id: `glass3`,
    displayName: `Gossamer Fin mk.3`,
    description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 300,
    basePrice: 770000 * game.itemPriceMultiplier,
    rarity: 12,
    thrustAmplification: 2.3,
    reliability: 0.45,
    maxHp: 1,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.1 },
    ],
  },
}
