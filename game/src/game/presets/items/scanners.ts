export const scanners: {
  [key in ScannerId]: BaseScannerData
} = {
  starter: {
    type: `scanner`,
    id: `starter`,
    displayName: `Echo-locator`,
    description: `Exactly what it sounds like.`,
    basePrice: 10,
    rarity: 0.1,
    sightRange: 0.4,
    shipScanRange: 0.1,
    maxHp: 8,
  },
}
