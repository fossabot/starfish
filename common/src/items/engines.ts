import game from '../gameConstants'

export const engines: {
  [key in EngineId]: BaseEngineData
} = {
  tutorial1: {
    buyable: false,
    special: true,
    type: `engine`,
    id: `tutorial1`,
    displayName: `Bubble Booster v1`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
    mass: 100 * game.itemMassMultiplier,
    basePrice: { credits: 0 * game.itemPriceMultiplier },
    rarity: 999999,
    thrustAmplification: 400,
    maxHp: 10,
    passives: [],
  },
  tiny1: {
    buyable: false,
    type: `engine`,
    id: `tiny1`,
    displayName: `Flappotron`,
    description: `Uses repeated inertial motion to very slowly shift the ship's position`,
    mass: 2000 * game.itemMassMultiplier,
    basePrice: { credits: 0 * game.itemPriceMultiplier },
    rarity: 0.2,
    thrustAmplification: 0.1,
    maxHp: 2,
    passives: [],
  },
  starter1: {
    type: `engine`,
    id: `starter1`,
    displayName: `Bubble Booster v1`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
    mass: 600 * game.itemMassMultiplier,
    basePrice: { credits: 17 * game.itemPriceMultiplier },
    rarity: 0.4,
    thrustAmplification: 0.7,
    maxHp: 5,
    repairDifficulty: 0.9,
    passives: [],
  },
  starter2: {
    type: `engine`,
    id: `starter2`,
    displayName: `Bubble Booster v2`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion. Version two slightly improves upon the chemical formula used in the fuel.`,
    mass: 800 * game.itemMassMultiplier,
    basePrice: { credits: 21 * game.itemPriceMultiplier },
    rarity: 1,
    thrustAmplification: 0.8,
    maxHp: 5,
    repairDifficulty: 0.85,
    passives: [],
  },
  starter3: {
    type: `engine`,
    id: `starter3`,
    displayName: `Bubble Booster v3`,
    description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion. Version three further improves upon the chemical formula used in the fuel.`,
    mass: 1000 * game.itemMassMultiplier,
    basePrice: { credits: 49 * game.itemPriceMultiplier },
    rarity: 1.5,
    thrustAmplification: 0.9,
    maxHp: 5,
    repairDifficulty: 0.8,
    passives: [],
  },

  // basic
  basic1: {
    type: `engine`,
    id: `basic1`,
    displayName: `Tail Thruster 100`,
    description: `Gains velocity through an oscillating power flux located at the rear of the ship.`,
    mass: 900 * game.itemMassMultiplier,
    basePrice: { credits: 80 * game.itemPriceMultiplier },
    rarity: 3,
    thrustAmplification: 1.2,
    maxHp: 4,
    passives: [
      {
        id: `boostBrake`,
        intensity: 0.1,
      },
    ],
  },
  basic2: {
    type: `engine`,
    id: `basic2`,
    displayName: `Tail Thruster 200`,
    description: `Gains velocity through an oscillating power flux located at the rear of the ship.`,
    mass: 1200 * game.itemMassMultiplier,
    basePrice: { credits: 190 * game.itemPriceMultiplier },
    rarity: 6,
    thrustAmplification: 1.4,
    maxHp: 4,
    passives: [
      {
        id: `boostBrake`,
        intensity: 0.2,
      },
    ],
  },
  basic3: {
    type: `engine`,
    id: `basic3`,
    displayName: `Tail Thruster 300`,
    description: `Gains velocity through an oscillating power flux located at the rear of the ship.`,
    mass: 1500 * game.itemMassMultiplier,
    basePrice: { credits: 350 * game.itemPriceMultiplier },
    rarity: 7,
    thrustAmplification: 1.6,
    maxHp: 4,
    passives: [
      {
        id: `boostBrake`,
        intensity: 0.3,
      },
    ],
  },

  // glass
  glass1: {
    type: `engine`,
    id: `glass1`,
    displayName: `Gossamer Fin mk.1`,
    description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 100 * game.itemMassMultiplier,
    basePrice: { credits: 210 * game.itemPriceMultiplier },
    rarity: 5,
    thrustAmplification: 1.7,
    reliability: 0.3,
    maxHp: 1,
    repairDifficulty: 1.2,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.03 },
    ],
  },
  glass2: {
    type: `engine`,
    id: `glass2`,
    displayName: `Gossamer Fin mk.2`,
    description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 100 * game.itemMassMultiplier,
    basePrice: { credits: 690 * game.itemPriceMultiplier },
    rarity: 9,
    thrustAmplification: 2,
    reliability: 0.4,
    maxHp: 1,
    repairDifficulty: 1.2,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.06 },
    ],
  },
  glass3: {
    type: `engine`,
    id: `glass3`,
    displayName: `Gossamer Fin mk.3`,
    description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
    mass: 100 * game.itemMassMultiplier,
    basePrice: { credits: 1770 * game.itemPriceMultiplier },
    rarity: 12,
    thrustAmplification: 2.3,
    reliability: 0.0,
    maxHp: 1,
    repairDifficulty: 1.2,
    passives: [
      { id: `boostChassisAgility`, intensity: 0.1 },
    ],
  },

  // heavy
  heavy1: {
    type: `engine`,
    id: `heavy1`,
    displayName: `Big Fin`,
    description: `Big fin. Fin big.`,
    mass: 1400 * game.itemMassMultiplier,
    basePrice: { credits: 70 * game.itemPriceMultiplier },
    rarity: 5,
    thrustAmplification: 1.1,
    reliability: 3,
    maxHp: 6,
    repairDifficulty: 0.8,
  },
  heavy2: {
    type: `engine`,
    id: `heavy2`,
    displayName: `Bigger Fin`,
    description: `Big fin. Fin big.`,
    mass: 1400 * game.itemMassMultiplier,
    basePrice: { credits: 230 * game.itemPriceMultiplier },
    rarity: 9,
    thrustAmplification: 1.2,
    reliability: 4,
    maxHp: 7,
    repairDifficulty: 0.8,
  },
  heavy3: {
    type: `engine`,
    id: `heavy3`,
    displayName: `Even Bigger Fin`,
    description: `Big fin. Fin big.`,
    mass: 1400 * game.itemMassMultiplier,
    basePrice: { credits: 600 * game.itemPriceMultiplier },
    rarity: 12,
    thrustAmplification: 1.3,
    reliability: 5,
    maxHp: 8,
    repairDifficulty: 0.8,
  },
}
