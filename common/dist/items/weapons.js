"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weapons = void 0;
const gameConstants_1 = __importDefault(require("../gameConstants"));
exports.weapons = {
    tutorial1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `tutorial1`,
        buyable: false,
        special: true,
        displayName: `Crustacean Cannon 1`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
        mass: 1000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 0 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.01,
        rarity: 9999999,
        reliability: 5,
        damage: 1.5 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 0.02 * 60 * 1000,
        maxHp: 10,
    },
    drone1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `drone1`,
        buyable: false,
        special: true,
        displayName: `StarTaser mk. 1`,
        description: `Retrofitted ship weapons have found their home in this pluggable cartidge for drone systems.`,
        mass: 600 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 0 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.075,
        rarity: 1,
        reliability: 1,
        damage: 0.2 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.5 * 60 * 1000,
        maxHp: 2,
    },
    tiny1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `tiny1`,
        displayName: `Squirt Gun`,
        description: `Ejects a short stream of hydrocarbons at a specified target. Deals little damage, so it's mostly useful for target practice.`,
        mass: 400 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 7 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.075,
        rarity: 0.4,
        damage: 0.5 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 2 * 60 * 1000,
        maxHp: 1.8,
        reliability: 3,
        repairDifficulty: 0.4,
        critChance: 0.2,
        maxLevel: 30,
        upgradableProperties: [
            `range`,
            `damage`,
            `chargeRequired`,
            `critChance`,
            `maxHp`,
        ],
        upgradeBonus: 0.005,
    },
    // cannons
    cannon1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `cannon1`,
        displayName: `Crustacean Cannon 1`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats.`,
        mass: 1300 * gameConstants_1.default.itemMassMultiplier,
        basePrice: {
            credits: 21 * gameConstants_1.default.itemPriceMultiplier,
        },
        range: 0.15,
        rarity: 0.5,
        damage: 0.85 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1 * 60 * 1000,
        maxHp: 2.8,
        repairDifficulty: 0.9,
        critChance: 0,
        maxLevel: 2,
        upgradableProperties: [`range`, `chargeRequired`],
    },
    cannon2: {
        type: `item`,
        itemType: `weapon`,
        itemId: `cannon2`,
        displayName: `Crustacean Cannon 2`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw. Not suitable for large-scale combat, but enough to scare away some smaller threats. The second entry in the series upgrades its range and damage.`,
        mass: 1400 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 35 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.175,
        rarity: 3,
        damage: Number(gameConstants_1.default.weaponDamageMultiplier),
        chargeRequired: 1 * 60 * 1000,
        maxHp: 2.8,
        repairDifficulty: 0.85,
        critChance: 0,
        maxLevel: 4,
        upgradableProperties: [`range`, `chargeRequired`],
    },
    cannon3: {
        type: `item`,
        itemType: `weapon`,
        itemId: `cannon3`,
        displayName: `Crustacean Cannon XD`,
        description: `Fires a two-pronged bolt of red energy at the target, somewhat resembling a crab's claw.`,
        mass: 1700 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 210 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.22,
        rarity: 8,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1 * 60 * 1000,
        maxHp: 2.8,
        repairDifficulty: 0.8,
        critChance: 0,
        maxLevel: 7,
        upgradableProperties: [`range`, `chargeRequired`],
    },
    // snipers
    sniper1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `sniper1`,
        displayName: `Monofang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 2400 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 22 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.25,
        rarity: 1.8,
        damage: 0.7 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 2 * 60 * 1000,
        maxHp: 1.7,
        repairDifficulty: 1.2,
        critChance: 0.15,
        maxLevel: 11,
        upgradableProperties: [`range`, `critChance`],
        upgradeBonus: 0.03,
    },
    sniper2: {
        type: `item`,
        itemType: `weapon`,
        itemId: `sniper2`,
        displayName: `Bifang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 2700 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 119 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.3,
        rarity: 4.9,
        damage: 0.8 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 2.5 * 60 * 1000,
        maxHp: 1.9,
        repairDifficulty: 1.2,
        critChance: 0.2,
        maxLevel: 15,
        upgradableProperties: [`range`, `critChance`],
        upgradeBonus: 0.03,
    },
    sniper3: {
        type: `item`,
        itemType: `weapon`,
        itemId: `sniper3`,
        displayName: `Trifang Harpoon`,
        description: `Able to shoot down targets from an impressive distance, the Harpoon class of weapons is feared by slow-moving craft who can't maneuver far enough from its reach.`,
        mass: 3000 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 470 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.35,
        rarity: 9.5,
        damage: 0.9 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 3 * 60 * 1000,
        maxHp: 2.1,
        repairDifficulty: 1.2,
        critChance: 0.25,
        maxLevel: 18,
        upgradableProperties: [`range`, `critChance`],
        upgradeBonus: 0.03,
    },
    // sabers
    saber1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `saber1`,
        displayName: `Swordfish Saber 1`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2200 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 31 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.07,
        rarity: 1.75,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 0.8 * 60 * 1000,
        maxHp: 3.5,
        reliability: 1.5,
        critChance: 0.1,
        slowingFactor: 0.05,
        maxLevel: 5,
        upgradableProperties: [`damage`],
    },
    saber2: {
        type: `item`,
        itemType: `weapon`,
        itemId: `saber2`,
        displayName: `Swordfish Saber 2`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2600 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 106 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.075,
        rarity: 4.5,
        damage: 2 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 0.8 * 60 * 1000,
        maxHp: 3.9,
        reliability: 1.5,
        critChance: 0.1,
        slowingFactor: 0.05,
        maxLevel: 8,
        upgradableProperties: [`damage`],
    },
    saber3: {
        type: `item`,
        itemType: `weapon`,
        itemId: `saber3`,
        displayName: `Swordfish Saber 3`,
        description: `Gets its name from its short range and relatively quick recharge time. Dueling ships wielding Swordfish Sabers have been known to perform fantastic dogfights around the moons of Osiris.`,
        mass: 2600 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 410 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.085,
        rarity: 10,
        damage: 2.3 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 0.7 * 60 * 1000,
        maxHp: 4.3,
        reliability: 1.5,
        critChance: 0.1,
        slowingFactor: 0.05,
        maxLevel: 10,
        upgradableProperties: [`damage`],
    },
    // blasters
    blaster1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `blaster1`,
        displayName: `Barnacle Blaster v1`,
        description: `Known for its corrosive effect on the hulls of ships, this weapon can melt through any armor given enough time.`,
        mass: 2400 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 50 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.15,
        rarity: 4,
        damage: 0.85 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.2 * 60 * 1000,
        maxHp: 4.1,
        repairDifficulty: 0.7,
        reliability: 0.8,
        critChance: 0.35,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.2,
                data: { type: `armor` },
            },
        ],
        maxLevel: 6,
        upgradableProperties: [`critChance`, `range`],
    },
    blaster2: {
        type: `item`,
        itemType: `weapon`,
        itemId: `blaster2`,
        displayName: `Barnacle Blaster v2`,
        description: `Known for its corrosive effect on the hulls of ships, this weapon can melt through any armor given enough time.`,
        mass: 2800 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 305 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.175,
        rarity: 7,
        damage: Number(gameConstants_1.default.weaponDamageMultiplier),
        chargeRequired: 1.2 * 60 * 1000,
        maxHp: 4.2,
        repairDifficulty: 0.65,
        reliability: 0.8,
        critChance: 0.38,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.2,
                data: { type: `armor` },
            },
        ],
        maxLevel: 8,
        upgradableProperties: [`critChance`, `range`],
    },
    blaster3: {
        type: `item`,
        itemType: `weapon`,
        itemId: `blaster3`,
        displayName: `Barnacle Blaster v3`,
        description: `Known for its corrosive effect on the hulls of ships, this weapon can melt through any armor given enough time.`,
        mass: 3300 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 810 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.22,
        rarity: 11,
        damage: 1.7 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.1 * 60 * 1000,
        maxHp: 4.3,
        repairDifficulty: 0.5,
        reliability: 0.8,
        critChance: 0.42,
        passives: [
            {
                id: `boostDamageToItemType`,
                intensity: 0.2,
                data: { type: `armor` },
            },
        ],
        maxLevel: 10,
        upgradableProperties: [`critChance`, `range`],
    },
    // slowing
    slowing1: {
        type: `item`,
        itemType: `weapon`,
        itemId: `slowing1`,
        displayName: `Grasping Tentacle I`,
        description: `Uses an electromagnetic tendril to ensnare even the zippiest of fish, making them ripe prey.`,
        mass: 1700 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 20 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.13,
        rarity: 2,
        damage: 0.35 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.4 * 60 * 1000,
        maxHp: 3.2,
        repairDifficulty: 1,
        reliability: 1,
        slowingFactor: 0.3,
        maxLevel: 3,
        upgradableProperties: [`slowingFactor`, `range`],
    },
    slowing2: {
        type: `item`,
        itemType: `weapon`,
        itemId: `slowing2`,
        displayName: `Grasping Tentacle II`,
        description: `Uses an electromagnetic tendril to ensnare even the zippiest of fish, making them ripe prey.`,
        mass: 1700 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 190 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.16,
        rarity: 6,
        damage: 0.4 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.3 * 60 * 1000,
        maxHp: 3.2,
        repairDifficulty: 1,
        reliability: 1,
        slowingFactor: 0.35,
        maxLevel: 5,
        upgradableProperties: [`slowingFactor`, `range`],
    },
    slowing3: {
        type: `item`,
        itemType: `weapon`,
        itemId: `slowing3`,
        displayName: `Grasping Tentacle III`,
        description: `Uses an electromagnetic tendril to ensnare even the zippiest of fish, making them ripe prey.`,
        mass: 1700 * gameConstants_1.default.itemMassMultiplier,
        basePrice: { credits: 480 * gameConstants_1.default.itemPriceMultiplier },
        range: 0.19,
        rarity: 11,
        damage: 0.5 * gameConstants_1.default.weaponDamageMultiplier,
        chargeRequired: 1.2 * 60 * 1000,
        maxHp: 3.2,
        repairDifficulty: 1,
        reliability: 1,
        slowingFactor: 0.4,
        maxLevel: 7,
        upgradableProperties: [`slowingFactor`, `range`],
    },
};
//# sourceMappingURL=weapons.js.map