"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.armor = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
exports.armor = {
    starter1: {
        type: `item`,
        itemType: `armor`,
        itemId: `starter1`,
        displayName: `Scaled Exoskeleton`,
        description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft.`,
        mass: 1200 * gameConstants_1.default.itemMassMultiplier,
        rarity: 0.2,
        basePrice: { credits: 22 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.1,
        maxHp: 5,
    },
    starter2: {
        type: `item`,
        itemType: `armor`,
        itemId: `starter2`,
        displayName: `Grooved Exoskeleton`,
        description: `Actually an organic growth on the outside of the ship, this rock-like shell will block a small amount of damage directed at your craft. Grooves in the husk allow for some projectiles to glance off of the hull, diluting damage slightly more than a scaled armor.`,
        mass: 1400 * gameConstants_1.default.itemMassMultiplier,
        rarity: 0.5,
        basePrice: { credits: 55 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.13,
        maxHp: 4,
        maxLevel: 2,
        upgradableProperties: [`damageReduction`],
    },
    // block
    block1: {
        type: `item`,
        itemType: `armor`,
        itemId: `block1`,
        displayName: `Hardened Shell 01`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 1100 * gameConstants_1.default.itemMassMultiplier,
        rarity: 1,
        basePrice: { credits: 50 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.35,
        maxHp: 3,
        maxLevel: 3,
        upgradableProperties: [`damageReduction`],
    },
    block2: {
        type: `item`,
        itemType: `armor`,
        itemId: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 1100 * gameConstants_1.default.itemMassMultiplier,
        rarity: 3.5,
        basePrice: { credits: 160 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.4,
        maxHp: 4,
        maxLevel: 4,
        upgradableProperties: [`damageReduction`],
    },
    block3: {
        type: `item`,
        itemType: `armor`,
        itemId: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 1100 * gameConstants_1.default.itemMassMultiplier,
        rarity: 6,
        basePrice: { credits: 510 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.45,
        maxHp: 5,
        maxLevel: 5,
        upgradableProperties: [`damageReduction`],
    },
    block4: {
        type: `item`,
        itemType: `armor`,
        itemId: `block2`,
        displayName: `Hardened Shell 02`,
        description: `Absorbs shockwaves effectively, as long as the armor doesn't crack.`,
        mass: 1100 * gameConstants_1.default.itemMassMultiplier,
        rarity: 8,
        basePrice: { credits: 1090 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.5,
        maxHp: 6,
    },
    // tough
    tough1: {
        type: `item`,
        itemType: `armor`,
        itemId: `tough1`,
        displayName: `Blubber 10k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 1400 * gameConstants_1.default.itemMassMultiplier,
        rarity: 2,
        basePrice: { credits: 60 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.05,
        maxHp: 7,
        maxLevel: 3,
        upgradableProperties: [`mass`],
        upgradeBonus: 0.05,
    },
    tough2: {
        type: `item`,
        itemType: `armor`,
        itemId: `tough2`,
        displayName: `Blubber 20k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 1600 * gameConstants_1.default.itemMassMultiplier,
        rarity: 5,
        basePrice: { credits: 290 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.05,
        maxHp: 9,
        maxLevel: 5,
        upgradableProperties: [`mass`],
        upgradeBonus: 0.05,
    },
    tough3: {
        type: `item`,
        itemType: `armor`,
        itemId: `tough2`,
        displayName: `Blubber 30k`,
        description: `Relies on raw mass and thickness to absorb damage.`,
        mass: 1900 * gameConstants_1.default.itemMassMultiplier,
        rarity: 9,
        basePrice: { credits: 970 * gameConstants_1.default.itemPriceMultiplier },
        damageReduction: 0.05,
        maxHp: 12,
        maxLevel: 7,
        upgradableProperties: [`mass`],
        upgradeBonus: 0.05,
    },
};
//# sourceMappingURL=armor.js.map