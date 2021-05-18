"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
function getThrustMagnitudeForSingleCrewMember(skill = 1, engineThrustMultiplier = 1) {
    return (math_1.default.lerp(0.0001, 0.001, skill / 100) *
        engineThrustMultiplier);
}
const tactics = [`aggressive`, `defensive`];
exports.default = {
    getThrustMagnitudeForSingleCrewMember,
    tactics,
};
//# sourceMappingURL=game.js.map