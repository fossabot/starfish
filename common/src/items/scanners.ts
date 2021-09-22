import game from '../game'

export const scanners: {
  [key in ScannerId]: BaseScannerData
} = {
  tutorial1: {
    type: `scanner`,
    id: `tutorial1`,
    displayName: `Echo-locator Mk.1`,
    description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius.`,
    mass: 2000,
    basePrice: 0 * game.itemPriceMultiplier,
    rarity: 0.6,
    sightRange: 0.3,
    shipScanRange: 0.1,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [`type`, `displayName`, `description`],
      chassis: [
        `id`,
        `displayName`,
        `description`,
        `basePrice`,
        `slots`,
      ],
    },
  },

  starter1: {
    type: `scanner`,
    id: `starter1`,
    displayName: `Echo-locator Mk.1`,
    description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius.`,
    mass: 2000,
    basePrice: 14 * game.itemPriceMultiplier,
    rarity: 0.6,
    sightRange: 0.3,
    shipScanRange: 0.1,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [`type`, `displayName`, `description`],
      chassis: [
        `id`,
        `displayName`,
        `description`,
        `basePrice`,
        `slots`,
      ],
    },
  },
  starter2: {
    type: `scanner`,
    id: `starter2`,
    displayName: `Echo-locator Mk.2`,
    description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius. The makers stuck to their guns (figuratively) in version two, providing slight upgrades to both sight and ship scanning range.`,
    mass: 2000,
    basePrice: 43 * game.itemPriceMultiplier,
    rarity: 3,
    sightRange: 0.35,
    shipScanRange: 0.13,
    reliability: 1.2,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [`type`, `displayName`, `description`],
      chassis: [
        `id`,
        `displayName`,
        `description`,
        `basePrice`,
        `slots`,
      ],
    },
  },

  // peek
  peek1: {
    type: `scanner`,
    id: `peek1`,
    displayName: `HP Scan Module`,
    description: `Specifically calibrated to determine the exact remaining HP of enemy craft. Has little range on its own, but works well when it can take advantage of another equipped scanner's range.`,
    mass: 1200,
    basePrice: 16 * game.itemPriceMultiplier,
    rarity: 5,
    sightRange: 0.1,
    shipScanRange: 0.1,
    maxHp: 1,
    shipScanData: {
      ...game.baseShipScanProperties,
      _hp: true,
      _maxHp: true,
    },
  },
  peek2: {
    type: `scanner`,
    id: `peek2`,
    displayName: `Crew Scan Module`,
    description: `Specifically calibrated to determine the crew status of enemy craft. Has little range on its own, but works well when it can take advantage of another equipped scanner's range.`,
    mass: 1100,
    basePrice: 10 * game.itemPriceMultiplier,
    rarity: 8,
    sightRange: 0.1,
    shipScanRange: 0.1,
    maxHp: 1,
    shipScanData: {
      ...game.baseShipScanProperties,
      crewMembers: [`location`, `stamina`],
    },
  },
  peek3: {
    type: `scanner`,
    id: `peek3`,
    displayName: `Equipment Scan Module`,
    description: `Specifically calibrated to determine the equipment status of enemy craft. Has little range on its own, but works well when it can take advantage of another equipped scanner's range.`,
    mass: 1500,
    basePrice: 25 * game.itemPriceMultiplier,
    rarity: 10,
    sightRange: 0.1,
    shipScanRange: 0.1,
    maxHp: 1,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [
        `repair`,
        `maxHp`,
        `type`,
        `displayName`,
        `description`,
      ],
    },
  },

  // wide
  wide1: {
    type: `scanner`,
    id: `wide1`,
    displayName: `Twilight Oculus 01`,
    description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
    mass: 3000,
    basePrice: 71 * game.itemPriceMultiplier,
    rarity: 1.3,
    sightRange: 0.45,
    shipScanRange: 0.2,
    maxHp: 4,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [
        `maxHp`,
        `type`,
        `displayName`,
        `description`,
      ],
      chassis: [`id`, `displayName`],
    },
  },
  wide2: {
    type: `scanner`,
    id: `wide2`,
    displayName: `Twilight Oculus 02`,
    description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
    mass: 3400,
    basePrice: 120 * game.itemPriceMultiplier,
    rarity: 4,
    sightRange: 0.6,
    shipScanRange: 0.28,
    maxHp: 4,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [
        `maxHp`,
        `type`,
        `displayName`,
        `description`,
      ],
      chassis: [`id`, `displayName`],
    },
  },
  wide3: {
    type: `scanner`,
    id: `wide3`,
    displayName: `Twilight Oculus 03`,
    description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
    mass: 3800,
    basePrice: 310 * game.itemPriceMultiplier,
    rarity: 8,
    sightRange: 0.75,
    shipScanRange: 0.35,
    maxHp: 4,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [
        `maxHp`,
        `type`,
        `displayName`,
        `description`,
      ],
      chassis: [`id`, `displayName`],
    },
  },

  // shipscanners
  shipscanner1: {
    type: `scanner`,
    id: `shipscanner1`,
    displayName: `Periscope v1`,
    description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
    mass: 700,
    basePrice: 50 * game.itemPriceMultiplier,
    rarity: 2.2,
    sightRange: 0.38,
    shipScanRange: 0.35,
    reliability: 0.7,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      _hp: true,
      _maxHp: true,
      items: [
        `repair`,
        `maxHp`,
        `type`,
        `description`,
        `displayName`,
        `baseCooldown`,
        `damage`,
        `thrustAmplification`,
        `range`,
        `sightRange`,
        `shipScanRange`,
      ],
      rooms: true,
      attackable: true,
      targetShip: true,
      radii: [`sight`, `scan`, `attack`, `broadcast`],
    },
  },
  shipscanner2: {
    type: `scanner`,
    id: `shipscanner2`,
    displayName: `Periscope v2`,
    description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
    mass: 700,
    basePrice: 130 * game.itemPriceMultiplier,
    rarity: 5.5,
    sightRange: 0.45,
    shipScanRange: 0.42,
    reliability: 0.7,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      _hp: true,
      _maxHp: true,
      items: [
        `repair`,
        `maxHp`,
        `type`,
        `description`,
        `displayName`,
        `baseCooldown`,
        `damage`,
        `thrustAmplification`,
        `range`,
        `sightRange`,
        `shipScanRange`,
      ],
      rooms: true,
      attackable: true,
      targetShip: true,
      radii: [`sight`, `scan`, `attack`, `broadcast`],
    },
  },
  shipscanner3: {
    type: `scanner`,
    id: `shipscanner3`,
    displayName: `Periscope v3`,
    description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
    mass: 700,
    basePrice: 270 * game.itemPriceMultiplier,
    rarity: 8.5,
    sightRange: 0.6,
    shipScanRange: 0.57,
    reliability: 0.7,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      _hp: true,
      _maxHp: true,
      items: [
        `repair`,
        `maxHp`,
        `type`,
        `description`,
        `displayName`,
        `baseCooldown`,
        `damage`,
        `thrustAmplification`,
        `range`,
        `sightRange`,
        `shipScanRange`,
      ],
      rooms: true,
      attackable: true,
      targetShip: true,
      radii: [`sight`, `scan`, `attack`, `broadcast`],
    },
  },

  treasure1: {
    type: `scanner`,
    id: `treasure1`,
    displayName: `Beachcomber v1`,
    description: ``,
    mass: 4200,
    basePrice: 250 * game.itemPriceMultiplier,
    rarity: 4,
    sightRange: 0.47,
    shipScanRange: 0.35,
    maxHp: 3,
    shipScanData: {
      ...game.baseShipScanProperties,
      items: [
        `maxHp`,
        `type`,
        `displayName`,
        `description`,
      ],
      chassis: [`id`, `displayName`],
    },
    passives: [
      { id: `boostDropAmount`, intensity: 0.15 },
      { id: `boostDropRarity`, intensity: 0.2 },
    ],
  },
}
