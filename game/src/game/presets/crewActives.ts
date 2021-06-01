export const data: {
  [key in CrewActiveType]: BaseCrewActiveData
} = {
  boost: {
    basePrice: 10,
    displayName: `Burst of Energy`,
    type: `boost`,
    rarity: 0.2,
  },
  quickFix: {
    basePrice: 10,
    displayName: `Crack Sealer`,
    type: `quickFix`,
    rarity: 0.2,
  },
  sightRange: {
    basePrice: 10,
    displayName: `Refraction Lens`,
    type: `sightRange`,
    rarity: 0.2,
  },
}
