"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engines = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
exports.engines = {
    tutorial1: {
        buyable: false,
        type: `engine`,
        id: `tutorial1`,
        displayName: `Bubble Booster v1`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
        mass: 4000,
        basePrice: 0 * dist_1.default.itemPriceMultiplier,
        rarity: 999999,
        thrustAmplification: 3,
        maxHp: 10,
    },
    starter1: {
        type: `engine`,
        id: `starter1`,
        displayName: `Bubble Booster v1`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
        mass: 4000,
        basePrice: 170 * dist_1.default.itemPriceMultiplier,
        rarity: 0.4,
        thrustAmplification: 0.7,
        maxHp: 5,
    },
    starter2: {
        type: `engine`,
        id: `starter2`,
        displayName: `Bubble Booster v2`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.Version two slightly improves upon the chemical formula used in the fuel.`,
        mass: 3900,
        basePrice: 450 * dist_1.default.itemPriceMultiplier,
        rarity: 1.5,
        thrustAmplification: 0.9,
        maxHp: 6,
    },
    // basic
    basic1: {
        type: `engine`,
        id: `basic1`,
        displayName: `Tail Thruster 100`,
        description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
        mass: 5000,
        basePrice: 800 * dist_1.default.itemPriceMultiplier,
        rarity: 1.5,
        thrustAmplification: 1.2,
        maxHp: 4,
    },
    basic2: {
        type: `engine`,
        id: `basic2`,
        displayName: `Tail Thruster 200`,
        description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
        mass: 5000,
        basePrice: 2500 * dist_1.default.itemPriceMultiplier,
        rarity: 3.5,
        thrustAmplification: 1.4,
        maxHp: 4,
    },
    // glass
    glass1: {
        type: `engine`,
        id: `glass1`,
        displayName: `Gossamer Fin mk.1`,
        description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 2100 * dist_1.default.itemPriceMultiplier,
        rarity: 3,
        thrustAmplification: 1.7,
        reliability: 0.3,
        maxHp: 1,
    },
    glass2: {
        type: `engine`,
        id: `glass2`,
        displayName: `Gossamer Fin mk.2`,
        description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 3900 * dist_1.default.itemPriceMultiplier,
        rarity: 5,
        thrustAmplification: 2,
        reliability: 0.4,
        maxHp: 1,
    },
    glass3: {
        type: `engine`,
        id: `glass3`,
        displayName: `Gossamer Fin mk.3`,
        description: `An ultravoilet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 7700 * dist_1.default.itemPriceMultiplier,
        rarity: 7,
        thrustAmplification: 2.3,
        reliability: 0.45,
        maxHp: 1,
    },
};
//# sourceMappingURL=engines.js.map