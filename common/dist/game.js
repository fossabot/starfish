"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const gameSpeedMultiplier = 24 * 3;
const baseSightRange = 0.2;
const baseRepairCost = 100;
const maxBroadcastLength = 200;
const baseStaminaUse = 0.00002 * gameSpeedMultiplier;
const baseXpGain = 0.5 * gameSpeedMultiplier;
const factionVendorMultiplier = 0.99;
const baseItemSellMultiplier = 0.75;
const noEngineThrustMagnitude = 0.02;
function getBaseDurabilityLossPerTick(maxHp) {
    return 0.00001 * gameSpeedMultiplier * (10 / maxHp);
}
function getThrustMagnitudeForSingleCrewMember(skill = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.00001, 0.0001, skill / 100) *
        engineThrustMultiplier *
        gameSpeedMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(skill) {
    return ((skill / globals_1.default.TICK_INTERVAL) *
        0.1 *
        gameSpeedMultiplier);
}
function getStaminaGainPerTickForSingleCrewMember() {
    return baseStaminaUse * 1.5;
}
function getWeaponCooldownReductionPerTick(level) {
    return (2 + level) * 3 * gameSpeedMultiplier;
}
function getCrewPassivePriceMultiplier(level) {
    return 1 + level ** 2;
}
const tactics = [`aggressive`, `defensive`];
const cargoTypes = [
    `salt`,
    `water`,
    `oxygen`,
    `credits`,
];
function stubify(prop, disallowPropName) {
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
    const circularReferencesRemoved = JSON.parse(JSON.stringify(gettersIncluded, (key, value) => {
        if ([`toUpdate`].includes(key))
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
    return circularReferencesRemoved;
}
exports.default = {
    gameSpeedMultiplier,
    baseSightRange,
    baseRepairCost,
    maxBroadcastLength,
    baseStaminaUse,
    baseXpGain,
    factionVendorMultiplier,
    baseItemSellMultiplier,
    noEngineThrustMagnitude,
    getBaseDurabilityLossPerTick,
    getRepairAmountPerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    getCrewPassivePriceMultiplier,
    tactics,
    cargoTypes,
    stubify,
};
//# sourceMappingURL=game.js.map