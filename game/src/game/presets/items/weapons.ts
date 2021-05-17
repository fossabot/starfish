export const weapons: { [key: string]: BaseWeaponData } = {}
weapons.cannon = {
  id: `cannon`,
  displayName: `Crustacean Cannon`,
  description: `Exactly what it sounds like.`,
  range: 1,
  damage: 0.3,
  baseCooldown: 5 * 60 * 1000,
}
