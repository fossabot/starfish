export const salt: CargoData = {
  name: `Salt`,
  type: `salt`,
  basePrice: 1,
  rarity: 0,
}

export const water: CargoData = {
  name: `Water`,
  type: `water`,
  basePrice: 1.4,
  rarity: 0,
}

export const oxygen: CargoData = {
  name: `Oxygen`,
  type: `oxygen`,
  basePrice: 2.6,
  rarity: 0,
}

export const plastic: CargoData = {
  name: `Plastic`,
  type: `plastic`,
  basePrice: 2,
  rarity: 1.5,
}

export const steel: CargoData = {
  name: `Steel`,
  type: `steel`,
  basePrice: 3.2,
  rarity: 3,
}

export const carbon: CargoData = {
  name: `Carbon`,
  type: `carbon`,
  basePrice: 2.5,
  rarity: 5,
}

export const titanium: CargoData = {
  name: `Titanium`,
  type: `titanium`,
  basePrice: 3.8,
  rarity: 7,
}

export const uranium: CargoData = {
  name: `Uranium`,
  type: `uranium`,
  basePrice: 5.2,
  rarity: 8,
}

export const data: { [key in CargoType]: CargoData } = {
  salt,
  water,
  oxygen,
  plastic,
  steel,
  carbon,
  titanium,
  uranium,
}
