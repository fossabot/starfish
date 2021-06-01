export const salt: CargoData = {
  name: `Salt`,
  type: `salt`,
  basePrice: 1,
  rarity: 0,
}

export const water: CargoData = {
  name: `Water`,
  type: `water`,
  basePrice: 2,
  rarity: 0,
}

export const oxygen: CargoData = {
  name: `Oxygen`,
  type: `oxygen`,
  basePrice: 3,
  rarity: 0,
}

export const data: { [key in CargoType]: CargoData } = {
  salt,
  water,
  oxygen,
}
