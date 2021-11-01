"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanners = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
// todo a scanner that can only see and not scan
exports.scanners = {
    tutorial1: {
        buyable: false,
        special: true,
        type: `scanner`,
        id: `tutorial1`,
        displayName: `Echo-locator Mk.1`,
        description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius.`,
        mass: 2000,
        basePrice: { credits: 0 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 0.6,
        sightRange: 0.3,
        shipScanRange: 0.1,
        maxHp: 2,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [`type`, `displayName`, `description`],
            chassis: [
                `id`,
                `displayName`,
                `description`,
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
        basePrice: { credits: 19 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 0.6,
        sightRange: 0.3,
        shipScanRange: 0.1,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [`type`, `displayName`, `description`],
            chassis: [
                `id`,
                `displayName`,
                `description`,
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
        basePrice: { credits: 49 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 3,
        sightRange: 0.35,
        shipScanRange: 0.13,
        reliability: 1.2,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [`type`, `displayName`, `description`],
            chassis: [
                `id`,
                `displayName`,
                `description`,
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
        basePrice: { credits: 21 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 5,
        sightRange: 0.1,
        shipScanRange: 0.1,
        maxHp: 1,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
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
        basePrice: { credits: 9 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 8,
        sightRange: 0.1,
        shipScanRange: 0.1,
        maxHp: 1,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            crewMembers: [`location`, `stamina`],
        },
    },
    peek3: {
        type: `scanner`,
        id: `peek3`,
        displayName: `Equipment Scan Module`,
        description: `Specifically calibrated to determine the equipment status of enemy craft. Has little range on its own, but works well when it can take advantage of another equipped scanner's range.`,
        mass: 1500,
        basePrice: { credits: 110 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 10,
        sightRange: 0.1,
        shipScanRange: 0.1,
        maxHp: 1,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [
                `repair`,
                `maxHp`,
                `type`,
                `displayName`,
                `description`,
            ],
        },
    },
    peek4: {
        type: `scanner`,
        id: `peek4`,
        buyable: false,
        displayName: `Planet Scan Module`,
        description: `Contains language packs and encryptions for nearly any system of mercantile communication in use across the universe, allowing for direct interface with planet vendors' price databases within a certain range.`,
        mass: 1000,
        basePrice: { credits: 77 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 10,
        sightRange: 0.1,
        shipScanRange: 0.1,
        maxHp: 1,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
        },
        scanPlanets: true,
    },
    // wide
    wide1: {
        type: `scanner`,
        id: `wide1`,
        displayName: `Twilight Oculus 01`,
        description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
        mass: 3000,
        basePrice: { credits: 91 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 1.3,
        sightRange: 0.45,
        shipScanRange: 0.2,
        maxHp: 4,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [
                `maxHp`,
                `type`,
                `displayName`,
                `description`,
            ],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    wide2: {
        type: `scanner`,
        id: `wide2`,
        displayName: `Twilight Oculus 02`,
        description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
        mass: 3400,
        basePrice: { credits: 280 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 4,
        sightRange: 0.6,
        shipScanRange: 0.28,
        maxHp: 4,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [
                `maxHp`,
                `type`,
                `displayName`,
                `description`,
            ],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    wide3: {
        type: `scanner`,
        id: `wide3`,
        displayName: `Twilight Oculus 03`,
        description: `Inspired by the evolution of hyper-sensitive eyes that evolved in the deep waters of Earth's oceans, this scanner has a wider range than most, but can only see a limited amount of information about nearby ships.`,
        mass: 3800,
        basePrice: { credits: 910 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 10,
        sightRange: 0.75,
        shipScanRange: 0.35,
        maxHp: 4,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [
                `maxHp`,
                `type`,
                `displayName`,
                `description`,
            ],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    // shipscanners
    shipscanner1: {
        type: `scanner`,
        id: `shipscanner1`,
        displayName: `Periscope v1`,
        description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
        mass: 700,
        basePrice: { credits: 50 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 2.2,
        sightRange: 0.38,
        shipScanRange: 0.35,
        reliability: 0.7,
        repairDifficulty: 0.85,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            _hp: true,
            _maxHp: true,
            mass: true,
            speed: true,
            direction: true,
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
            targetShip: true,
            radii: [`sight`, `scan`, `attack`, `broadcast`],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    shipscanner2: {
        type: `scanner`,
        id: `shipscanner2`,
        displayName: `Periscope v2`,
        description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
        mass: 700,
        basePrice: { credits: 180 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 5.5,
        sightRange: 0.45,
        shipScanRange: 0.42,
        reliability: 0.7,
        repairDifficulty: 0.85,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            _hp: true,
            _maxHp: true,
            mass: true,
            speed: true,
            direction: true,
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
            targetShip: true,
            radii: [`sight`, `scan`, `attack`, `broadcast`],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    shipscanner3: {
        type: `scanner`,
        id: `shipscanner3`,
        displayName: `Periscope v3`,
        description: `The distance that this part protrudes from the ship makes it an easy target, but it excels at seeing exactly who's around you.`,
        mass: 700,
        basePrice: { credits: 370 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 8.5,
        sightRange: 0.6,
        shipScanRange: 0.57,
        reliability: 0.7,
        repairDifficulty: 0.85,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            _hp: true,
            _maxHp: true,
            mass: true,
            speed: true,
            direction: true,
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
            targetShip: true,
            radii: [`sight`, `scan`, `attack`, `broadcast`],
            chassis: [`id`, `displayName`, `slots`],
        },
    },
    treasure1: {
        type: `scanner`,
        id: `treasure1`,
        displayName: `Beachcomber v1`,
        description: `Uses magnetic fields to probe deep into the depths of any wreckage. The perfect companion to the sunburned few among us who are dedicated enough to seek out treasure wherever it may lie.`,
        mass: 4200,
        basePrice: { credits: 450 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 4,
        sightRange: 0.47,
        shipScanRange: 0.35,
        repairDifficulty: 1.3,
        maxHp: 3,
        shipScanData: {
            ...gameConstants_1.default.baseShipScanProperties,
            items: [
                `maxHp`,
                `type`,
                `displayName`,
                `description`,
            ],
            chassis: [`id`, `displayName`, `slots`],
        },
        passives: [
            { id: `boostDropAmount`, intensity: 0.15 },
            { id: `boostDropRarity`, intensity: 0.2 },
        ],
    },
};
//# sourceMappingURL=scanners.js.map