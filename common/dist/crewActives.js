"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewActives = exports.crewActiveBaseGlobalCooldown = void 0;
const math_1 = __importDefault(require("./math"));
const text_1 = __importDefault(require("./text"));
const gameConstants_1 = __importDefault(require("./gameConstants"));
const game_1 = __importDefault(require("./game"));
exports.crewActiveBaseGlobalCooldown = 1000 * 5; // 60 //* 60 //* 24 * 1
exports.crewActives = {
    instantStamina: {
        id: `instantStamina`,
        displayName: `Sunny Day`,
        description: (a, level) => `Instantly gain ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) * 100, 0)} stamina.`,
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
    },
    cargoSweep: {
        id: `cargoSweep`,
        displayName: `Cargo Magnet`,
        description: (a, level) => `Sweep the immediate area to look for floating cargo (attractor power ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) * 100, 0)}%).`,
        cooldown: exports.crewActiveBaseGlobalCooldown * 4,
    },
    boostShipSightRange: {
        id: `boostShipSightRange`,
        displayName: `Pupil Trilation`,
        description: function (a, level) {
            return `Boost the ship's sight range by ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) * 100, 0)}% for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        notify: true,
        cooldown: exports.crewActiveBaseGlobalCooldown * 2.5,
        duration: 1000 * 60 * 60 * 1,
    },
    repairDrone: {
        id: `repairDrone`,
        displayName: `NanoRepair Swarm`,
        description: function (a, level) {
            return `Repair ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) *
                gameConstants_1.default.displayHPMultiplier, 0)} health over ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        cooldown: exports.crewActiveBaseGlobalCooldown * 8,
        duration: 1000 * 60 * 60 * 1,
        notify: true,
    },
    combatDrone: {
        id: `combatDrone`,
        displayName: `Combat Drone`,
        description: function (a, level) {
            return `Deploy a level ${1 +
                Math.floor(game_1.default.getActiveIntensity(a, level) * 4)} drone that will attack nearby enemies for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        notify: true,
        cooldown: exports.crewActiveBaseGlobalCooldown * 12,
        duration: 1000 * 60 * 60 * 3,
    },
    weaponRechargeSpeed: {
        id: `weaponRechargeSpeed`,
        displayName: `Weapon Overcharge`,
        description: function (a, level) {
            return `Increase full crew's weapon recharge speed by ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) * 100, 0)}% for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        notify: true,
        cooldown: exports.crewActiveBaseGlobalCooldown * 11,
        duration: 1000 * 60 * 60 * 3,
    },
    boostStrength: {
        id: `boostStrength`,
        displayName: `Can of Spinach`,
        description: function (a, level) {
            return `Increase strength level by ${math_1.default.r2(Math.floor(game_1.default.getActiveIntensity(a, level) * 4) + 1, 0)} for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
        duration: 1000 * 60 * 60 * 3,
    },
    boostDexterity: {
        id: `boostDexterity`,
        displayName: `Adrenaline Shot`,
        description: function (a, level) {
            return `Increase dexterity level by ${math_1.default.r2(Math.floor(game_1.default.getActiveIntensity(a, level) * 4) + 1, 0)} for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
        duration: 1000 * 60 * 60 * 3,
    },
    boostIntellect: {
        id: `boostIntellect`,
        displayName: `Neural Steroids`,
        description: function (a, level) {
            return `Increase intellect level by ${math_1.default.r2(Math.floor(game_1.default.getActiveIntensity(a, level) * 4) + 1, 0)} for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
        duration: 1000 * 60 * 60 * 3,
    },
    boostCharisma: {
        id: `boostCharisma`,
        displayName: `Charisma Potion`,
        description: function (a, level) {
            return `Increase charisma level by ${math_1.default.r2(Math.floor(game_1.default.getActiveIntensity(a, level) * 4) + 1, 0)} for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
        duration: 1000 * 60 * 60 * 3,
    },
    boostMorale: {
        id: `boostMorale`,
        displayName: `Sea Shanty`,
        description: function (a, level) {
            return `Increase the morale of the entire crew by ${math_1.default.r2(game_1.default.getActiveIntensity(a, level) * 100, 0)}%.`;
        },
        notify: true,
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
    },
};
//# sourceMappingURL=crewActives.js.map