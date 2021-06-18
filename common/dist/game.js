"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const Profiler_1 = require("./Profiler");
const gameShipLimit = 100;
const gameSpeedMultiplier = 24 * 3;
const baseSightRange = 0.2;
const baseRepairCost = 30;
const maxBroadcastLength = 200;
const baseStaminaUse = 0.00001 * gameSpeedMultiplier;
const baseXpGain = 0.1 * gameSpeedMultiplier;
const factionVendorMultiplier = 0.98;
const factionAllegianceFriendCutoff = 10;
const baseItemSellMultiplier = 0.75;
const noEngineThrustMagnitude = 0.02;
const aiDifficultyMultiplier = 1;
const baseShipScanProperties = {
    id: true,
    name: true,
    human: true,
    ai: true,
    headerBackground: true,
    tagline: true,
    dead: true,
    attackable: true,
    previousLocations: true,
    location: true,
    planet: [`name`, `location`],
    faction: [`ai`, `name`, `id`, `color`],
    species: [`id`, `singular`, `icon`],
    chassis: [`displayName`],
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
    return totalValue / Math.sqrt(equipmentCount) || 0;
}
function getMaxCockpitChargeForSingleCrewMember(level = 1) {
    return math_1.default.lerp(1, 10, level / 100);
}
function getCockpitChargePerTickForSingleCrewMember(level = 1) {
    return math_1.default.lerp(0.002, 0.0002, level / 100); // backwards because you gain max charge
}
function getThrustMagnitudeForSingleCrewMember(level = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.2, 1, level / 100) *
        engineThrustMultiplier *
        gameSpeedMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(0.2, 1.3, level / 100) /
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
    `Very Shallow`,
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
    baseItemSellMultiplier,
    noEngineThrustMagnitude,
    aiDifficultyMultiplier,
    baseShipScanProperties,
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