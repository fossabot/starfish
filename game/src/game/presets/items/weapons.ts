export const weapons: {
  [key in WeaponId]: BaseWeaponData
} = {
  tutorial1: {
    type: `weapon`,
    id: `tutorial1`,
    displayName: `Crustacean Cannon 1`,
    description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
    basePrice: 10,
    range: 0.01,
    rarity: 9999999,
    reliability: 5,
    damage: 3,
    baseCooldown: 0.05 * 60 * 1000,
    maxHp: 10,
  },
  tiny1: {
    type: `weapon`,
    id: `tiny1`,
    displayName: `Squirt Gun`,
    description: `Ejects a short stream of hydrocarbons at a specified target. Deals little damage, so it's mostly useful for target practice.`,
    basePrice: 10,
    range: 0.75,
    rarity: 0.3,
    damage: 0.75,
    baseCooldown: 2 * 60 * 1000,
    maxHp: 4,
  },
  // cannons
  cannon1: {
    type: `weapon`,
    id: `cannon1`,
    displayName: `Crustacean Cannon 1`,
    description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
    basePrice: 10,
    range: 0.15,
    rarity: 0.5,
    damage: 2,
    baseCooldown: 1 * 60 * 1000,
    maxHp: 10,
  },
  cannon2: {
    type: `weapon`,
    id: `cannon2`,
    displayName: `Crustacean Cannon 2`,
    description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats. The second entry in the series upgrades its range and damage.`,
    basePrice: 10,
    range: 0.175,
    rarity: 2,
    damage: 2.5,
    baseCooldown: 1 * 60 * 1000,
    maxHp: 10,
  },

  // sabers
  saber1: {
    type: `weapon`,
    id: `saber1`,
    displayName: `Swordfish Saber 1`,
    description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
    basePrice: 10,
    range: 0.05,
    rarity: 0.75,
    damage: 4,
    baseCooldown: 0.8 * 60 * 1000,
    maxHp: 14,
  },

  // snipers
  sniper1: {
    type: `weapon`,
    id: `sniper1`,
    displayName: `Harpoon 1`,
    description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
    basePrice: 10,
    range: 0.25,
    rarity: 1.8,
    damage: 0.5,
    baseCooldown: 2 * 60 * 1000,
    maxHp: 6,
  },
}
