const cargoSpace: BaseCrewPassiveData = {
  displayName: `Cargo Space`,
  id: `cargoSpace`,
  basePrice: 100,
  factor: 10,
  rarity: 1,
}

const data: {
  [key in CrewPassiveId]: BaseCrewPassiveData
} = {
  cargoSpace,
}
export default data
