"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const gameSpeedMultiplier = 10;
const baseRepairCost = 100;
function getThrustMagnitudeForSingleCrewMember(skill = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.00001, 0.0001, skill / 100) *
        engineThrustMultiplier *
        gameSpeedMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(skill) {
    return ((skill / globals_1.default.TICK_INTERVAL) *
        0.3 *
        gameSpeedMultiplier);
}
function getStaminaGainPerTickForSingleCrewMember() {
    return 0.00003 * gameSpeedMultiplier;
}
function getWeaponCooldownReductionPerTick(level) {
    return (2 + level) * 3 * gameSpeedMultiplier;
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
        ].includes(key))
            return value?.id || null;
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
    baseRepairCost,
    getRepairAmountPerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    tactics,
    cargoTypes,
    stubify,
};
//# sourceMappingURL=game.js.map