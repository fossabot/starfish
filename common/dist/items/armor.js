"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.armor = void 0;
const game_1 = __importDefault(require("../game"));
exports.armor = {
    starter1: {
        type: `armor`,
        id: `starter1`,
        displayName: `Scaled Exoskeleton`,
        description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft.`,
        mass: 6000,
        rarity: 0.2,
        basePrice: 12 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.1,
        maxHp: 5,
    },
    starter2: {
        type: `armor`,
        id: `starter2`,
        displayName: `Grooved Exoskeleton`,
        description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft. Grooves in the husk allow for some projectiles to glance off of the hull, diluting damage slightly more than a scaled armor.`,
        mass: 7200,
        rarity: 0.5,
        basePrice: 35 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.13,
        maxHp: 4,
    },
    // block
    block1: {
        type: `armor`,
        id: `block1`,
        displayName: `Hardened Shell 01`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 5500,
        rarity: 1,
        basePrice: 50 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.35,
        maxHp: 3,
    },
    block2: {
        type: `armor`,
        id: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 5500,
        rarity: 3.5,
        basePrice: 160 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.4,
        maxHp: 4,
    },
    block3: {
        type: `armor`,
        id: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 5500,
        rarity: 6,
        basePrice: 510 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.45,
        maxHp: 5,
    },
    block4: {
        type: `armor`,
        id: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 5500,
        rarity: 8,
        basePrice: 890 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.5,
        maxHp: 6,
    },
    // tough
    tough1: {
        type: `armor`,
        id: `tough1`,
        displayName: `Blubber 10k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 10000,
        rarity: 2,
        basePrice: 60 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.05,
        maxHp: 7,
    },
    tough2: {
        type: `armor`,
        id: `tough2`,
        displayName: `Blubber 20k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 20000,
        rarity: 5,
        basePrice: 190 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.05,
        maxHp: 9,
    },
    tough3: {
        type: `armor`,
        id: `tough2`,
        displayName: `Blubber 30k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 30000,
        rarity: 9,
        basePrice: 770 * game_1.default.itemPriceMultiplier,
        damageReduction: 0.05,
        maxHp: 12,
    },
};
//# sourceMappingURL=armor.js.map