export const engines: {
  [key in EngineId]: BaseEngineData
} = {
  starter: {
    type: `engine`,
    id: `starter`,
    displayName: `Bubble Booster`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    rarity: 0.1,
    thrustAmplification: 1,
    maxHp: 10,
  },
}
