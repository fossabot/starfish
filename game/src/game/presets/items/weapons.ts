export const weapons: { [key: string]: BaseWeaponData } = {}
weapons.cannon = {
  type: `weapon`,
  id: `cannon`,
  displayName: `Crustacean Cannon`,
  description: `Exactly what it sounds like.`,
  range: 1,
  damage: 2,
  baseCooldown: 20 * 1000,
  maxHp: 10,
}
