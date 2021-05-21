"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
function getThrustMagnitudeForSingleCrewMember(skill = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.0001, 0.001, skill / 100) *
        engineThrustMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(skill) {
    return (skill / globals_1.default.TICK_INTERVAL) * 0.3;
}
const tactics = [`aggressive`, `defensive`];
const cargoTypes = [
    `food`,
    `metals`,
    `textiles`,
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
    getRepairAmountPerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    tactics,
    cargoTypes,
    stubify,
};
//# sourceMappingURL=game.js.map