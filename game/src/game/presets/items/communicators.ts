export const communicators: {
  [key in CommunicatorId]: BaseCommunicatorData
} = {
  starter1: {
    type: `communicator`,
    id: `starter1`,
    displayName: `Antennae Mk.1`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you.`,
    basePrice: 10,
    rarity: 0.4,
    range: 0.5,
    antiGarble: 0.1,
    maxHp: 8,
  },
  starter2: {
    type: `communicator`,
    id: `starter2`,
    displayName: `Antennae Mk.2`,
    description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you. Mark two increases range and clarity for the antennae.`,
    basePrice: 10,
    rarity: 1.2,
    range: 0.6,
    antiGarble: 0.2,
    maxHp: 10,
  },
}
