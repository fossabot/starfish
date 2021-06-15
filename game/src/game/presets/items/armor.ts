export const armor: {
  [key in ArmorId]: BaseArmorData
} = {
  starter1: {
    type: `armor`,
    id: `starter1`,
    displayName: `Scaled Exoskeleton`,
    description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft.`,
    mass: 2000,
    rarity: 0.1,
    basePrice: 10,
    damageReduction: 0.1,
    maxHp: 12,
  },
  starter2: {
    type: `armor`,
    id: `starter2`,
    displayName: `Grooved Exoskeleton`,
    description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft. Grooves in the husk allow for some projectiles to glance off of the hull, diluting damage slightly more than a scaled armor.`,
    mass: 2000,
    rarity: 0.1,
    basePrice: 10,
    damageReduction: 0.13,
    maxHp: 14,
  },
}
