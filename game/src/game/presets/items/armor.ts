export const armor: {
  [key in ArmorId]: BaseArmorData
} = {
  starter1: {
    type: `armor`,
    id: `starter1`,
    displayName: `Scaled Exoskeleton`,
    description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft.`,
    rarity: 0.1,
    basePrice: 10,
    damageReduction: 0.1,
    maxHp: 12,
  },
  starter2: {
    type: `armor`,
    id: `starter2`,
    displayName: `Grooved Exoskeleton`,
    description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft. Grooves allow for some projectiles to glance off of the hull, diluting damage slightly more than scales.`,
    rarity: 0.1,
    basePrice: 10,
    damageReduction: 0.13,
    maxHp: 14,
  },
}
