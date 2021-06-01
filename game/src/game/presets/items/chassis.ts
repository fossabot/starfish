export const chassis: {
  [key in ChassisId]: BaseChassisData
} = {
  starter: {
    type: `chassis`,
    id: `starter`,
    displayName: `Fishbowl 01`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    slots: 4,
    rarity: 0.1,
  },
  second: {
    type: `chassis`,
    id: `second`,
    displayName: `Fishbowl 02`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    slots: 5,
    rarity: 0.15,
  },
}
