import c from '../../../../../common/dist'
export const scanners: {
  [key in ScannerId]: BaseScannerData
} = {
  starter1: {
    type: `scanner`,
    id: `starter1`,
    displayName: `Echo-locator Mk.1`,
    description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius.`,
    basePrice: 10,
    rarity: 0.6,
    sightRange: 1.3,
    shipScanRange: 1,
    maxHp: 8,
    shipScanData: {
      ...c.baseShipScanProperties,
      items: [
        `repair`,
        `type`,
        `description`,
        `displayName`,
        `baseCooldown`,
        // `cooldownRemaining`,
        `damage`,
        `thrustAmplification`,
        `range`,
        `sightRange`,
        `shipScanRange`,
      ],
      crewMembers: [`location`, `stamina`],
      rooms: true,
      _hp: true,
      _maxHp: true,
      attackable: true,
      targetShip: true,
      radii: [`sight`, `scan`, `attack`, `broadcast`],
    },
  },
  starter2: {
    type: `scanner`,
    id: `starter2`,
    displayName: `Echo-locator Mk.2`,
    description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius. The makers stuck to their guns (figuratively) in version two, providing slight upgrades to both sight and ship scanning range.`,
    basePrice: 10,
    rarity: 1.2,
    sightRange: 0.35,
    shipScanRange: 0.13,
    maxHp: 10,
    shipScanData: {
      ...c.baseShipScanProperties,
      items: [`maxHp`, `type`, `displayName`],
      chassis: [
        `id`,
        `displayName`,
        `description`,
        `basePrice`,
        `slots`,
      ],
    },
  },

  // shipscanners
  shipscanner1: {
    type: `scanner`,
    id: `shipscanner1`,
    displayName: `Periscope v1`,
    description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
    basePrice: 10,
    rarity: 2.2,
    sightRange: 0.4,
    shipScanRange: 0.37,
    maxHp: 6,
    shipScanData: {
      ...c.baseShipScanProperties,
    },
  },
}
