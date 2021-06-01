export const weapons: {
  [key in WeaponId]: BaseWeaponData
} = {
  cannon: {
    type: `weapon`,
    id: `cannon`,
    displayName: `Crustacean Cannon`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    range: 0.15,
    rarity: 0.1,
    damage: 2,
    baseCooldown: 1 * 60 * 1000,
    maxHp: 10,
  },
}
