"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanners = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
exports.scanners = {
    starter1: {
        type: `scanner`,
        id: `starter1`,
        displayName: `Echo-locator Mk.1`,
        description: `Sound doesn't exist in space, so the name is simply a callback to past evolutions of the technology. Uses reflecting beams to determine the distance and position of objects within a small radius.`,
        basePrice: 10,
        rarity: 0.6,
        sightRange: 0.3,
        shipScanRange: 0.1,
        maxHp: 8,
        shipScanData: {
            ...dist_1.default.baseShipScanProperties,
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
        reliability: 1.2,
        maxHp: 10,
        shipScanData: {
            ...dist_1.default.baseShipScanProperties,
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
        sightRange: 0.38,
        shipScanRange: 0.35,
        maxHp: 6,
        shipScanData: {
            ...dist_1.default.baseShipScanProperties,
            items: [
                `repair`,
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
            _hp: true,
            _maxHp: true,
            attackable: true,
            targetShip: true,
            radii: [`sight`, `scan`, `attack`, `broadcast`],
        },
    },
};
//# sourceMappingURL=scanners.js.map