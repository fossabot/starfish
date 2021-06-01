export const communicators: {
  [key in CommunicatorId]: BaseCommunicatorData
} = {
  starter: {
    type: `communicator`,
    id: `starter`,
    displayName: `Antennae Mk.1`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    rarity: 0.1,
    range: 0.5,
    antiGarble: 0.1,
    maxHp: 8,
  },
}
