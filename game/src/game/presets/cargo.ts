export const salt: CargoData = {
  name: `Salt`,
  type: `salt`,
  basePrice: 100,
  rarity: 0,
}

export const water: CargoData = {
  name: `Water`,
  type: `water`,
  basePrice: 140,
  rarity: 0,
}

export const oxygen: CargoData = {
  name: `Oxygen`,
  type: `oxygen`,
  basePrice: 260,
  rarity: 0,
}

export const plastic: CargoData = {
  name: `Plastic`,
  type: `plastic`,
  basePrice: 200,
  rarity: 1.5,
}

export const steel: CargoData = {
  name: `Steel`,
  type: `steel`,
  basePrice: 320,
  rarity: 3,
}

export const carbon: CargoData = {
  name: `Carbon`,
  type: `carbon`,
  basePrice: 250,
  rarity: 5,
}

export const titanium: CargoData = {
  name: `Titanium`,
  type: `titanium`,
  basePrice: 380,
  rarity: 7,
}

export const uranium: CargoData = {
  name: `Uranium`,
  type: `uranium`,
  basePrice: 520,
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
