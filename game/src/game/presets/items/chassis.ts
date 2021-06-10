export const chassis: {
  [key in ChassisId]: BaseChassisData
} = {
  starter1: {
    type: `chassis`,
    id: `starter1`,
    displayName: `Fishbowl 01`,
    description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
    basePrice: 10,
    slots: 4,
    bunks: 3,
    rarity: 0.5,
  },
  starter2: {
    type: `chassis`,
    id: `starter2`,
    displayName: `Fishbowl 02`,
    description: `They say that a goldfish will grow to the size of its container. The goldfish in this bowl are feeling cramped, restrained to shallower waters.`,
    basePrice: 10,
    slots: 5,
    bunks: 4,
    rarity: 1,
  },

  // solo

  solo1: {
    type: `chassis`,
    id: `solo1`,
    displayName: `Solo Swimmer mk.1`,
    description: `Some prefer to handle things alone. This ship chassis eschews crew space for maximum equipment slots.`,
    basePrice: 10,
    slots: 6,
    bunks: 1,
    rarity: 3,
  },
}
