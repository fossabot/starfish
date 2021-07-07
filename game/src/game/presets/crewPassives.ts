export const cargoSpace: BaseCrewPassiveData = {
  displayName: `Cargo Space`,
  type: `cargoSpace`,
  basePrice: 100,
  factor: 10,
  rarity: 1,
}

export const data: {
  [key in CrewPassiveType]: BaseCrewPassiveData
} = {
  cargoSpace,
}
