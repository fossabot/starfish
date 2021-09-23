import game from '../game'

export const communicators: {
  [key in CommunicatorId]: BaseCommunicatorData
} = {
  starter1: {
    type: `communicator`,
    id: `starter1`,
    displayName: `Antennae Mk.1`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you.`,
    mass: 600,
    basePrice: 10 * game.itemPriceMultiplier,
    rarity: 0.4,
    range: 0.32,
    antiGarble: 0.1,
    maxHp: 2,
    reliability: 0.5,
  },
  starter2: {
    type: `communicator`,
    id: `starter2`,
    displayName: `Antennae Mk.2`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you. Mark two increases range and clarity for the antennae.`,
    mass: 800,
    basePrice: 18 * game.itemPriceMultiplier,
    rarity: 2,
    range: 0.38,
    antiGarble: 0.2,
    maxHp: 3,
    reliability: 0.6,
  },

  // distance
  distance1: {
    type: `communicator`,
    id: `distance1`,
    displayName: `Biolelectric Listener Mk.1`,
    description: `Using a passive organic sensor, this communications array can send out messages from an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 200,
    basePrice: 31 * game.itemPriceMultiplier,
    rarity: 3,
    range: 0.75,
    antiGarble: -0.15,
    maxHp: 2,
    reliability: 1,
  },
  distance2: {
    type: `communicator`,
    id: `distance2`,
    displayName: `Biolelectric Listener Mk.2`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 250,
    basePrice: 40 * game.itemPriceMultiplier,
    rarity: 7,
    range: 0.9,
    antiGarble: -0.1,
    maxHp: 2,
    reliability: 1.2,
  },
  distance3: {
    type: `communicator`,
    id: `distance3`,
    displayName: `Biolelectric Listener Mk.3`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 250,
    basePrice: 90 * game.itemPriceMultiplier,
    rarity: 9,
    range: 1.3,
    antiGarble: -0.1,
    maxHp: 3,
    reliability: 1.3,
  },
  distance4: {
    type: `communicator`,
    id: `distance4`,
    displayName: `Biolelectric Listener Mk.4`,
    description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
    mass: 250,
    basePrice: 120 * game.itemPriceMultiplier,
    rarity: 12,
    range: 1.7,
    antiGarble: -0.1,
    maxHp: 3,
    reliability: 1.4,
  },

  // clarity
  clarity1: {
    type: `communicator`,
    id: `clarity1`,
    displayName: `Signal Gills 2000`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 600,
    basePrice: 30 * game.itemPriceMultiplier,
    rarity: 1.1,
    range: 0.33,
    antiGarble: 0.3,
    maxHp: 2,
    reliability: 0.8,
  },
  clarity2: {
    type: `communicator`,
    id: `clarity2`,
    displayName: `Signal Gills 2001`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 700,
    basePrice: 50 * game.itemPriceMultiplier,
    rarity: 6,
    range: 0.4,
    antiGarble: 0.35,
    maxHp: 2,
    reliability: 0.8,
  },
  clarity3: {
    type: `communicator`,
    id: `clarity3`,
    displayName: `Signal Gills 3000`,
    description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
    mass: 1200,
    basePrice: 99 * game.itemPriceMultiplier,
    rarity: 9,
    range: 0.5,
    antiGarble: 0.45,
    maxHp: 3,
    reliability: 0.8,
  },
}
