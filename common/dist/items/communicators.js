"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicators = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
const broadcastRangeMultiplier = 2;
exports.communicators = {
    starter1: {
        type: `item`,
        itemType: `communicator`,
        itemId: `starter1`,
        displayName: `Antennae Mk.1`,
        description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you.`,
        mass: 200 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 10 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 0.4,
        range: 0.35 * broadcastRangeMultiplier,
        clarity: 0.1,
        maxHp: 1,
        reliability: 0.2,
        maxLevel: 2,
        upgradableProperties: [`clarity`, `reliability`],
    },
    starter2: {
        type: `item`,
        itemType: `communicator`,
        itemId: `starter2`,
        displayName: `Antennae Mk.2`,
        description: `These two protrusions from the head of the ship are always on the lookout for slight vibrations in the electromagnetic fields around you. Mark two increases range and clarity for the antennae.`,
        mass: 270 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 18 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 2,
        range: 0.42 * broadcastRangeMultiplier,
        clarity: 0.2,
        maxHp: 1.5,
        reliability: 0.6,
        maxLevel: 3,
        upgradableProperties: [`clarity`, `reliability`],
    },
    // distance
    distance1: {
        type: `item`,
        itemType: `communicator`,
        itemId: `distance1`,
        displayName: `Bioelectric Listener Mk.1`,
        description: `Using a passive organic sensor, this communications array can send out messages from an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
        mass: 80 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 31 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 3,
        range: Number(broadcastRangeMultiplier),
        clarity: -0.15,
        maxHp: 2,
        reliability: 1.2,
        repairDifficulty: 0.75,
        maxLevel: 4,
        upgradableProperties: [`range`],
    },
    distance2: {
        type: `item`,
        itemType: `communicator`,
        itemId: `distance2`,
        displayName: `Bioelectric Listener Mk.2`,
        description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
        mass: 80 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 77 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 7,
        range: 1.2 * broadcastRangeMultiplier,
        clarity: -0.1,
        maxHp: 2.5,
        reliability: 1.3,
        repairDifficulty: 0.75,
        maxLevel: 4,
        upgradableProperties: [`range`],
    },
    distance3: {
        type: `item`,
        itemType: `communicator`,
        itemId: `distance3`,
        displayName: `Bioelectric Listener Mk.3`,
        description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
        mass: 80 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 115 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 9,
        range: 1.6 * broadcastRangeMultiplier,
        clarity: -0.1,
        maxHp: 3,
        reliability: 1.4,
        repairDifficulty: 0.75,
        maxLevel: 4,
        upgradableProperties: [`range`],
    },
    distance4: {
        type: `item`,
        itemType: `communicator`,
        itemId: `distance4`,
        displayName: `Bioelectric Listener Mk.4`,
        description: `Using a passive organic sensor, this communications array can send out messages to an impressive radius. Messages are filtered through a biological subsrate, however, so there is a clarity loss.`,
        mass: 80 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 210 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 12,
        range: 2 * broadcastRangeMultiplier,
        clarity: -0.1,
        maxHp: 3,
        reliability: 1.5,
        repairDifficulty: 0.75,
        maxLevel: 4,
        upgradableProperties: [`range`],
    },
    // clarity
    clarity1: {
        type: `item`,
        itemType: `communicator`,
        itemId: `clarity1`,
        displayName: `Signal Gills 2000`,
        description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
        mass: 140 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 30 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 1.1,
        range: 0.4 * broadcastRangeMultiplier,
        clarity: 0.3,
        maxHp: 1.8,
        reliability: 0.8,
        maxLevel: 5,
        upgradableProperties: [`clarity`],
        upgradeBonus: 0.3,
    },
    clarity2: {
        type: `item`,
        itemType: `communicator`,
        itemId: `clarity2`,
        displayName: `Signal Gills 2001`,
        description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
        mass: 160 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 93 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 6,
        range: 0.46 * broadcastRangeMultiplier,
        clarity: 0.35,
        maxHp: 2.1,
        reliability: 0.8,
        maxLevel: 6,
        upgradableProperties: [`clarity`],
        upgradeBonus: 0.3,
    },
    clarity3: {
        type: `item`,
        itemType: `communicator`,
        itemId: `clarity3`,
        displayName: `Signal Gills 3000`,
        description: `Sharp senses are crucial to stay alive in this fish-eat-fish world. This short-range communicator provides superior clarity to make sure broadcasts are clear and crisp.`,
        mass: 180 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 211 * gameConstants_1.default.itemPriceMultiplier },
        rarity: 9,
        range: 0.55 * broadcastRangeMultiplier,
        clarity: 0.45,
        maxHp: 2.8,
        reliability: 0.8,
        maxLevel: 8,
        upgradableProperties: [`clarity`],
        upgradeBonus: 0.3,
    },
};
//# sourceMappingURL=communicators.js.map