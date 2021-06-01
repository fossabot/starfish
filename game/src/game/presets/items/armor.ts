export const armor: {
  [key in ArmorId]: BaseArmorData
} = {
  starter: {
    type: `armor`,
    id: `starter`,
    displayName: `Exoskeleton`,
    description: `Exactly what it sounds like.`,
    rarity: 0.1,
    basePrice: 10,
    damageReduction: 0.2,
    maxHp: 12,
  },
}
