"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weapons = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
exports.weapons = {
    tutorial1: {
        type: `weapon`,
        id: `tutorial1`,
        buyable: false,
        special: true,
        displayName: `Crustacean Cannon 1`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
        mass: 1000,
        basePrice: { credits: 0 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.01,
        rarity: 9999999,
        reliability: 5,
        damage: 1.5 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 0.05 * 60 * 1000,
        maxHp: 10,
    },
    tiny1: {
        type: `weapon`,
        id: `tiny1`,
        displayName: `Squirt Gun`,
        description: `Ejects a short stream of hydrocarbons at a specified target. Deals little damage, so it's mostly useful for target practice.`,
        mass: 400,
        basePrice: { credits: 7 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.075,
        rarity: 0.4,
        damage: 0.5 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 2 * 60 * 1000,
        maxHp: 2,
        reliability: 3,
        repairDifficulty: 0.4,
        critChance: 0.2,
    },
    // cannons
    cannon1: {
        type: `weapon`,
        id: `cannon1`,
        displayName: `Crustacean Cannon 1`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
        mass: 1300,
        basePrice: {
            credits: 21 * gameConstants_1.default.itemPriceMultiplier,
        },
        range: 0.15,
        rarity: 0.5,
        damage: 0.85 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 1 * 60 * 1000,
        maxHp: 3,
        repairDifficulty: 0.9,
        critChance: 0,
    },
    cannon2: {
        type: `weapon`,
        id: `cannon2`,
        displayName: `Crustacean Cannon 2`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats. The second entry in the series upgrades its range and damage.`,
        mass: 1400,
        basePrice: { credits: 35 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.175,
        rarity: 3,
        damage: Number(gameConstants_1.default.weaponDamageMultiplier),
        baseCooldown: 1 * 60 * 1000,
        maxHp: 3,
        repairDifficulty: 0.85,
        critChance: 0,
    },
    cannon3: {
        type: `weapon`,
        id: `cannon3`,
        displayName: `Crustacean Cannon XD`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw.`,
        mass: 1700,
        basePrice: { credits: 210 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.22,
        rarity: 8,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 1 * 60 * 1000,
        maxHp: 3,
        repairDifficulty: 0.8,
        critChance: 0,
    },
    // snipers
    sniper1: {
        type: `weapon`,
        id: `sniper1`,
        displayName: `Monofang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 2400,
        basePrice: { credits: 22 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.25,
        rarity: 1.8,
        damage: 0.7 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 2 * 60 * 1000,
        maxHp: 2,
        repairDifficulty: 1.2,
        critChance: 0.15,
    },
    sniper2: {
        type: `weapon`,
        id: `sniper2`,
        displayName: `Bifang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 2700,
        basePrice: { credits: 119 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.3,
        rarity: 4.9,
        damage: 0.8 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 2.5 * 60 * 1000,
        maxHp: 2,
        repairDifficulty: 1.2,
        critChance: 0.2,
    },
    sniper3: {
        type: `weapon`,
        id: `sniper3`,
        displayName: `Trifang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 3000,
        basePrice: { credits: 470 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.35,
        rarity: 9.5,
        damage: 0.9 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 3 * 60 * 1000,
        maxHp: 2,
        repairDifficulty: 1.2,
        critChance: 0.25,
    },
    // sabers
    saber1: {
        type: `weapon`,
        id: `saber1`,
        displayName: `Swordfish Saber 1`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2200,
        basePrice: { credits: 31 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.05,
        rarity: 1.75,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 0.8 * 60 * 1000,
        maxHp: 4,
        reliability: 1.5,
        critChance: 0.1,
    },
    saber2: {
        type: `weapon`,
        id: `saber2`,
        displayName: `Swordfish Saber 2`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2600,
        basePrice: { credits: 106 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.055,
        rarity: 4.5,
        damage: 2 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 0.8 * 60 * 1000,
        maxHp: 4,
        reliability: 1.5,
        critChance: 0.1,
    },
    saber3: {
        type: `weapon`,
        id: `saber3`,
        displayName: `Swordfish Saber 3`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2600,
        basePrice: { credits: 410 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.065,
        rarity: 10,
        damage: 2.3 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 0.7 * 60 * 1000,
        maxHp: 4,
        reliability: 1.5,
        critChance: 0.1,
    },
    // blasters
    blaster1: {
        type: `weapon`,
        id: `blaster1`,
        displayName: `Barnacle Blaster v1`,
        description: ``,
        mass: 4000,
        basePrice: { credits: 50 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.15,
        rarity: 4,
        damage: 0.85 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 1.2 * 60 * 1000,
        maxHp: 4,
        repairDifficulty: 0.7,
        critChance: 0.35,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.1,
                data: { type: `armor` },
            },
        ],
    },
    blaster2: {
        type: `weapon`,
        id: `blaster2`,
        displayName: `Barnacle Blaster v2`,
        description: ``,
        mass: 4600,
        basePrice: { credits: 305 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.175,
        rarity: 7,
        damage: Number(gameConstants_1.default.weaponDamageMultiplier),
        baseCooldown: 1.2 * 60 * 1000,
        maxHp: 4,
        repairDifficulty: 0.65,
        critChance: 0.38,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.1,
                data: { type: `armor` },
            },
        ],
    },
    blaster3: {
        type: `weapon`,
        id: `blaster3`,
        displayName: `Barnacle Blaster v3`,
        description: ``,
        mass: 5100,
        basePrice: { credits: 810 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.22,
        rarity: 11,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        baseCooldown: 1.1 * 60 * 1000,
        maxHp: 4,
        repairDifficulty: 0.5,
        critChance: 0.42,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.1,
                data: { type: `armor` },
            },
        ],
    },
};
//# sourceMappingURL=weapons.js.map