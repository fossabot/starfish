const cargoSpace: BaseCrewPassiveData = {
  displayName: `Cargo Space`,
  id: `cargoSpace`,
  basePrice: 1000,
  factor: 10,
  rarity: 1,
  description: `Boost your personal cargo capacity by 10, assuming that your ship's chassis can support the weight.`,
}

const data: {
  [key in CrewPassiveId]: BaseCrewPassiveData
} = {
  cargoSpace,
}
export default data
