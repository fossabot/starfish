"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
function getUnitVectorFromThatBodyToThisBody(thisBody, thatBody) {
    if (thisBody.location[0] === thatBody.location[0] &&
        thisBody.location[1] === thatBody.location[1]) {
        return [0, 0];
    }
    const angleBetween = math_1.default.angleFromAToB(thatBody.location, thisBody.location);
    return math_1.default.degreesToUnitVector(angleBetween);
}
function getGravityForceVectorOnThisBodyDueToThatBody(thisBody, thatBody) {
    if (!thisBody ||
        !thatBody ||
        !thisBody.mass ||
        !thatBody.mass)
        return [0, 0];
    const m1 = thisBody.mass || 0;
    const m2 = thatBody.mass || 0;
    const r = math_1.default.distance(thisBody.location, thatBody.location) *
        globals_1.default.KM_PER_AU *
        globals_1.default.M_PER_KM;
    if (r === 0)
        return [0, 0];
    const G = globals_1.default.GRAVITATIONAL_CONSTANT;
    const gravityForce = (-G * m1 * m2) / r ** 2;
    const vectorToThisBody = getUnitVectorFromThatBodyToThisBody(thisBody, thatBody);
    const gravityForceVector = vectorToThisBody.map((i) => i * gravityForce);
    return gravityForceVector; // kg * m / second == N
}
exports.default = {
    getUnitVectorFromThatBodyToThisBody,
    getGravityForceVectorOnThisBodyDueToThatBody,
};
//# sourceMappingURL=physics.js.map