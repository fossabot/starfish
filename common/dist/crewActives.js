"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crewActives = exports.crewActiveBaseGlobalCooldown = void 0;
const math_1 = __importDefault(require("./math"));
const text_1 = __importDefault(require("./text"));
exports.crewActiveBaseGlobalCooldown = 1000 * 60; //* 60 //* 24 * 1
exports.crewActives = {
    instantStamina: {
        id: `instantStamina`,
        displayName: `Sunny Day`,
        description: (p) => `Instantly gain ${math_1.default.r2(p.intensity * 100, 0)} stamina.`,
        cooldown: exports.crewActiveBaseGlobalCooldown * 2,
    },
    cargoSweep: {
        id: `cargoSweep`,
        displayName: `Cargo Magnet`,
        description: (p) => `Sweep the immediate area to look for floating cargo (attractor power ${math_1.default.r2(p.intensity * 100, 0)}%).`,
        cooldown: exports.crewActiveBaseGlobalCooldown * 3,
    },
    boostShipSightRange: {
        id: `boostShipSightRange`,
        displayName: `Pupil Trilation`,
        description: function (p) {
            return `Boost the ship's sight range by ${math_1.default.r2(p.intensity * 100, 0)}% for ${text_1.default.msToTimeString(this.duration || 1000 * 60 * 60 * 24 * 1)}.`;
        },
        notify: true,
        cooldown: exports.crewActiveBaseGlobalCooldown * 2.5,
        duration: 1000 * 60 * 60 * 1,
    },
};
//# sourceMappingURL=crewActives.js.map