import game from '../gameConstants'

export const communicators: {
  [key in CommunicatorId]: BaseCommunicatorData
} = {
  starter1: {
    type: `communicator`,
    id: `starter1`,
    displayName: `Antennae Mk.1`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you.`,
    mass: 200 * game.itemMassMultiplier,
    basePrice: { credits: 10 * game.itemPriceMultiplier },
    rarity: 0.4,
    range: 0.35,
    antiGarble: 0.1,
    maxHp: 2,
    reliability: 0.2,
  },
  starter2: {
    type: `communicator`,
    id: `starter2`,
    displayName: `Antennae Mk.2`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you. Mark two increases range and clarity for the antennae.`,
    mass: 270 * game.itemMassMultiplier,
    basePrice: { credits: 18 * game.itemPriceMultiplier },
    rarity: 2,
    range: 0.42,
    antiGarble: 0.2,
    maxHp: 3,
    reliability: 0.6,
  },

  // distance
  distance1: {
    type: `communicator`,
    id: `distance1`,
    displayName: `Bioelectric Listener Mk.1`,
    description: `Using a passive organic sensor, this communications array can send out messages from an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 80 * game.itemMassMultiplier,
    basePrice: { credits: 31 * game.itemPriceMultiplier },
    rarity: 3,
    range: 1,
    antiGarble: -0.15,
    maxHp: 2,
    reliability: 1.2,
    repairDifficulty: 0.75,
  },
  distance2: {
    type: `communicator`,
    id: `distance2`,
    displayName: `Bioelectric Listener Mk.2`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 80 * game.itemMassMultiplier,
    basePrice: { credits: 77 * game.itemPriceMultiplier },
    rarity: 7,
    range: 1.2,
    antiGarble: -0.1,
    maxHp: 2,
    reliability: 1.3,
    repairDifficulty: 0.75,
  },
  distance3: {
    type: `communicator`,
    id: `distance3`,
    displayName: `Bioelectric Listener Mk.3`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 80 * game.itemMassMultiplier,
    basePrice: { credits: 115 * game.itemPriceMultiplier },
    rarity: 9,
    range: 1.6,
    antiGarble: -0.1,
    maxHp: 3,
    reliability: 1.4,
    repairDifficulty: 0.75,
  },
  distance4: {
    type: `communicator`,
    id: `distance4`,
    displayName: `Bioelectric Listener Mk.4`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 80 * game.itemMassMultiplier,
    basePrice: { credits: 210 * game.itemPriceMultiplier },
    rarity: 12,
    range: 2,
    antiGarble: -0.1,
    maxHp: 3,
    reliability: 1.5,
    repairDifficulty: 0.75,
  },

  // clarity
  clarity1: {
    type: `communicator`,
    id: `clarity1`,
    displayName: `Signal Gills 2000`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 140 * game.itemMassMultiplier,
    basePrice: { credits: 30 * game.itemPriceMultiplier },
    rarity: 1.1,
    range: 0.4,
    antiGarble: 0.3,
    maxHp: 2,
    reliability: 0.8,
  },
  clarity2: {
    type: `communicator`,
    id: `clarity2`,
    displayName: `Signal Gills 2001`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 160 * game.itemMassMultiplier,
    basePrice: { credits: 93 * game.itemPriceMultiplier },
    rarity: 6,
    range: 0.46,
    antiGarble: 0.35,
    maxHp: 2,
    reliability: 0.8,
  },
  clarity3: {
    type: `communicator`,
    id: `clarity3`,
    displayName: `Signal Gills 3000`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 180 * game.itemMassMultiplier,
    basePrice: { credits: 211 * game.itemPriceMultiplier },
    rarity: 9,
    range: 0.55,
    antiGarble: 0.45,
    maxHp: 3,
    reliability: 0.8,
  },
}
