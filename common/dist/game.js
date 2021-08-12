"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const Profiler_1 = require("./Profiler");
const gameShipLimit = 100;
const gameSpeedMultiplier = 1 * 12;
const baseSightRange = 0.05;
const baseRepairCost = 3000;
const maxBroadcastLength = 200;
const baseStaminaUse = 0.00001 * gameSpeedMultiplier;
const baseXpGain = 0.05 * gameSpeedMultiplier;
const itemPriceMultiplier = 1;
const factionVendorMultiplier = 0.98;
const factionAllegianceFriendCutoff = 50;
const baseItemSellMultiplier = 0.75;
const noEngineThrustMagnitude = 0.02;
const aiDifficultyMultiplier = 0.5;
const attackRemnantExpireTime = (1000 * 60 * 60 * 24 * 3) / gameSpeedMultiplier;
const cacheExpireTime = (1000 * 60 * 60 * 24 * 14) / gameSpeedMultiplier;
const baseShipScanProperties = {
    id: true,
    name: true,
    human: true,
    ai: true,
    headerBackground: true,
    tagline: true,
    level: true,
    dead: true,
    attackable: true,
    previousLocations: true,
    location: true,
    planet: [`name`, `location`],
    faction: [`ai`, `name`, `id`, `color`],
    species: [`id`, `singular`, `icon`],
    chassis: [`displayName`],
};
const sameFactionShipScanProperties = {
    _hp: true,
    _maxHp: true,
};
const tactics = [`aggressive`, `defensive`];
const cargoTypes = [
    `salt`,
    `water`,
    `oxygen`,
    `credits`,
];
function getHitDamage(weapon, totalMunitionsSkill = 0) {
    return (weapon.damage *
        (1 + (totalMunitionsSkill - 1) / 50) *
        (weapon.repair || 0));
}
function getBaseDurabilityLossPerTick(maxHp, reliability) {
    return ((0.00001 * gameSpeedMultiplier * (10 / maxHp)) /
        reliability);
}
function getRadiusDiminishingReturns(totalValue, equipmentCount) {
    if (equipmentCount === 0)
        return 0;
    return totalValue / Math.sqrt(equipmentCount) || 0; // this might be too harsh? 5 and 2 = 4.9
}
function getMaxCockpitChargeForSingleCrewMember(level = 1) {
    return math_1.default.lerp(1, 5, (level - 1) / 100);
}
function getCockpitChargePerTickForSingleCrewMember(level = 1) {
    const flatMod = 0.6;
    return math_1.default.lerp(0.002 * flatMod, 0.0005 * flatMod, level / 100); // backwards because you gain max charge
}
function getThrustMagnitudeForSingleCrewMember(level = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.2, 1, level / 100) *
        engineThrustMultiplier *
        gameSpeedMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(0.15, 1.0, level / 100) /
        globals_1.default.TICK_INTERVAL) *
        gameSpeedMultiplier);
}
function getStaminaGainPerTickForSingleCrewMember() {
    return baseStaminaUse * 1.5;
}
function getWeaponCooldownReductionPerTick(level) {
    return ((2 + math_1.default.lerp(1, 20, level / 100)) *
        3 *
        gameSpeedMultiplier);
}
function getCrewPassivePriceMultiplier(level) {
    return 1 + level ** 2;
}
const taglineOptions = [
    `Tester`,
    `✨Supporter✨`,
    `🔨Admin🔨`,
    // to be assigned
    `Big Flipper`,
    `Whale, I'll be!`,
    `Splish Splash`,
    `Holy Mackerel!`,
    `Small Pond 4 Life`,
    `Nautical Nonsense`,
    `Very Shallow`,
    // flight (implemented)
    `River Runner`,
    `Hell's Angelfish`,
    `Flying Fish`,
    // todo more flight taglines for distance traveled
    // exploration (implemented)
    `Small Pond Paddler`,
    `Current Rider`,
    `Migratory`,
    `EAC-zy Rider`,
    // credits (implemented)
    `Easy Target`,
    `Moneybags`,
    // bunk (implemented)
    `Nap Champions`,
    // upgrade to x chassis
    `Big Kahuna`,
    // planet time
    `Home Schooled`,
    // combat achievements
    `Nibbler`,
    `On the Hunt`,
    `Blood in the Water`,
    `Feeding Frenzied`,
    `Venomous`,
    `Big Chompers`,
    `Bait and Switch`,
    // dying (implemented)
    `Delicious with Lemon`,
    // crew member numbers (implemented)
    `Guppy`,
    `Schoolin'`,
    `Pod`,
    `Big Fish`,
];
const headerBackgroundOptions = [
    { id: `Default`, url: `default.jpg` },
    { id: `Blue Faction 1`, url: `blue1.svg` },
    { id: `Purple Faction 1`, url: `purple1.svg` },
    { id: `Green Faction 1`, url: `green1.svg` },
    { id: `Flat 1`, url: `flat1.svg` },
    { id: `Flat 2`, url: `flat2.svg` },
    { id: `Gradient 1`, url: `gradient1.svg` },
    { id: `Gradient 2`, url: `gradient2.svg` },
    { id: `Gradient 3`, url: `gradient3.svg` },
    { id: `Constellation 1`, url: `stars1.jpg` },
    { id: `Vintage 1`, url: `vintage1.jpg` },
];
function stubify(prop, disallowPropName) {
    const profiler = new Profiler_1.Profiler(10, `stubify`, false, 0);
    profiler.step(`getters`);
    const gettersIncluded = { ...prop };
    const proto = Object.getPrototypeOf(prop);
    const getKeyValue = (key) => (obj) => obj[key];
    // c.log(Object.getOwnPropertyNames(proto))
    for (const key of Object.getOwnPropertyNames(proto)) {
        const desc = Object.getOwnPropertyDescriptor(proto, key);
        const hasGetter = desc && typeof desc.get === `function`;
        if (hasGetter) {
            gettersIncluded[key] = getKeyValue(key)(prop);
        }
    }
    profiler.step(`stringify and parse`);
    const circularReferencesRemoved = JSON.parse(JSON.stringify(gettersIncluded, (key, value) => {
        if ([`toUpdate`, `_stub`].includes(key))
            return;
        if ([
            `game`,
            `ship`,
            `attacker`,
            `defender`,
            `crewMember`,
            `homeworld`,
        ].includes(key))
            return value?.id ? { id: value.id } : null;
        if (disallowPropName?.includes(key))
            return value?.id || undefined;
        if ([`ships`].includes(key) && Array.isArray(value))
            return value.map((v) => stubify(v, [
                `visible`,
                `seenPlanets`,
                `enemiesInAttackRange`,
            ]));
        return value;
    }));
    // circularReferencesRemoved.lastUpdated = Date.now()
    profiler.end();
    return circularReferencesRemoved;
}
exports.default = {
    gameShipLimit,
    gameSpeedMultiplier,
    baseSightRange,
    baseRepairCost,
    maxBroadcastLength,
    baseStaminaUse,
    baseXpGain,
    factionVendorMultiplier,
    factionAllegianceFriendCutoff,
    itemPriceMultiplier,
    baseItemSellMultiplier,
    noEngineThrustMagnitude,
    aiDifficultyMultiplier,
    attackRemnantExpireTime,
    cacheExpireTime,
    baseShipScanProperties,
    sameFactionShipScanProperties,
    getHitDamage,
    getBaseDurabilityLossPerTick,
    getRadiusDiminishingReturns,
    getRepairAmountPerTickForSingleCrewMember,
    getMaxCockpitChargeForSingleCrewMember,
    getCockpitChargePerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    getCrewPassivePriceMultiplier,
    tactics,
    cargoTypes,
    taglineOptions,
    headerBackgroundOptions,
    stubify,
};
//# sourceMappingURL=game.js.map