"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engines = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
exports.engines = {
    tutorial1: {
        buyable: false,
        type: `engine`,
        id: `tutorial1`,
        displayName: `Bubble Booster v1`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
        mass: 4000,
        basePrice: 0 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 999999,
        thrustAmplification: 3,
        maxHp: 10,
        passives: [],
    },
    starter1: {
        type: `engine`,
        id: `starter1`,
        displayName: `Bubble Booster v1`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.`,
        mass: 4000,
        basePrice: 17 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 0.4,
        thrustAmplification: 0.7,
        maxHp: 5,
        repairDifficulty: 0.9,
        passives: [],
    },
    starter2: {
        type: `engine`,
        id: `starter2`,
        displayName: `Bubble Booster v2`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.Version two slightly improves upon the chemical formula used in the fuel.`,
        mass: 3900,
        basePrice: 20 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 1,
        thrustAmplification: 0.8,
        maxHp: 5,
        repairDifficulty: 0.85,
        passives: [],
    },
    starter3: {
        type: `engine`,
        id: `starter3`,
        displayName: `Bubble Booster v3`,
        description: `Expels repeated payloads of hyrdocarbon-based fuel that explode outside of the ship, forming a trail that looks not unlike bubbles. A highly inefficient form of propulsion.Version two slightly improves upon the chemical formula used in the fuel.`,
        mass: 3900,
        basePrice: 40 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 1.5,
        thrustAmplification: 0.9,
        maxHp: 5,
        repairDifficulty: 0.8,
        passives: [],
    },
    // basic
    basic1: {
        type: `engine`,
        id: `basic1`,
        displayName: `Tail Thruster 100`,
        description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
        mass: 5000,
        basePrice: 80 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 3,
        thrustAmplification: 1.2,
        maxHp: 4,
        passives: [
            {
                id: `boostBrake`,
                intensity: 0.1,
            },
        ],
    },
    basic2: {
        type: `engine`,
        id: `basic2`,
        displayName: `Tail Thruster 200`,
        description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
        mass: 5000,
        basePrice: 180 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 6,
        thrustAmplification: 1.4,
        maxHp: 4,
        passives: [
            {
                id: `boostBrake`,
                intensity: 0.2,
            },
        ],
    },
    basic3: {
        type: `engine`,
        id: `basic3`,
        displayName: `Tail Thruster 300`,
        description: `Gains velocity through an oscillating power flow located at the rear of the ship.`,
        mass: 5000,
        basePrice: 300 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 7,
        thrustAmplification: 1.6,
        maxHp: 4,
        passives: [
            {
                id: `boostBrake`,
                intensity: 0.3,
            },
        ],
    },
    // glass
    glass1: {
        type: `engine`,
        id: `glass1`,
        displayName: `Gossamer Fin mk.1`,
        description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 210 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 5,
        thrustAmplification: 1.7,
        reliability: 0.3,
        maxHp: 1,
        repairDifficulty: 1.2,
        passives: [
            { id: `boostChassisAgility`, intensity: 0.03 },
        ],
    },
    glass2: {
        type: `engine`,
        id: `glass2`,
        displayName: `Gossamer Fin mk.2`,
        description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 390 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 9,
        thrustAmplification: 2,
        reliability: 0.4,
        maxHp: 1,
        repairDifficulty: 1.2,
        passives: [
            { id: `boostChassisAgility`, intensity: 0.06 },
        ],
    },
    glass3: {
        type: `engine`,
        id: `glass3`,
        displayName: `Gossamer Fin mk.3`,
        description: `An ultraviolet fin extends gloriously from the ship. As swift and as vulnerable as it is beautiful.`,
        mass: 300,
        basePrice: 770 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 12,
        thrustAmplification: 2.3,
        reliability: 0.0,
        maxHp: 1,
        repairDifficulty: 1.2,
        passives: [
            { id: `boostChassisAgility`, intensity: 0.1 },
        ],
    },
    // heavy
    heavy1: {
        type: `engine`,
        id: `heavy1`,
        displayName: `Big Fin`,
        description: `Big fin. Fin big.`,
        mass: 8000,
        basePrice: 70 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 5,
        thrustAmplification: 1.1,
        reliability: 3,
        maxHp: 6,
        repairDifficulty: 0.8,
    },
    heavy2: {
        type: `engine`,
        id: `heavy2`,
        displayName: `Bigger Fin`,
        description: `Big fin. Fin big.`,
        mass: 10000,
        basePrice: 130 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 9,
        thrustAmplification: 1.2,
        reliability: 4,
        maxHp: 7,
        repairDifficulty: 0.8,
    },
    heavy3: {
        type: `engine`,
        id: `heavy3`,
        displayName: `Even Bigger Fin`,
        description: `Big fin. Fin big.`,
        mass: 12000,
        basePrice: 400 * gameConstants_1.default.itemPriceMultiplier,
        rarity: 12,
        thrustAmplification: 1.3,
        reliability: 5,
        maxHp: 8,
        repairDifficulty: 0.8,
    },
};
//# sourceMappingURL=engines.js.map