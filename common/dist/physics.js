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
    const massProduct = m1 * m2;
    const rangeInMeters = Math.min(globals_1.default.gravityRange, math_1.default.distance(thisBody.location, thatBody.location)) *
        globals_1.default.kmPerAu *
        globals_1.default.mPerKm;
    const rangeAsPercentOfGravityRadius = rangeInMeters /
        (globals_1.default.gravityRange *
            globals_1.default.kmPerAu *
            globals_1.default.mPerKm);
    if (rangeInMeters === 0)
        return [0, 0];
    const scalingFunctions = {
        defaultRealGravity: () => (-globals_1.default.gravitationalConstant * massProduct) /
            rangeInMeters ** 2,
        // this one is okay, it just feels like faraway planets are very strong even when you're right next to another planet
        linear: () => -1 *
            0.0000005 *
            Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
            (1 - rangeAsPercentOfGravityRadius),
        // middle ground between linear and exponential
        quadratic: () => -1 *
            0.0000005 *
            Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
            (rangeAsPercentOfGravityRadius - 1) ** 2,
        // stronger lean towards exponential
        cubic: () => -1 *
            0.0000005 *
            Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
            (-1 * (rangeAsPercentOfGravityRadius - 1) ** 3),
        // even stronger lean towards exponential
        sixthPower: () => -1 *
            0.0000005 *
            Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
            (rangeAsPercentOfGravityRadius - 1) ** 6,
    };
    // * ----- current scaling function in use -----
    const scalingFunction = scalingFunctions.sixthPower;
    // * ----- flat gravity scaling -----
    const gravityScaleFactor = 0.2;
    const gravityForce = scalingFunction() * gravityScaleFactor;
    // const differenceFromDefault =
    //   gravityForce -
    //   scalingFunctions.defaultRealGravity() *
    //     gravityScaleFactor
    // c.log({
    //   name: thatBody.name,
    //   gravityForce,
    //   default:
    //     scalingFunctions.defaultRealGravity() *
    //     gravityScaleFactor,
    //   differenceFromDefault,
    //   rangeAsPercentOfGravityRadius,
    // })
    const vectorToThisBody = getUnitVectorFromThatBodyToThisBody(thisBody, thatBody);
    const gravityForceVector = vectorToThisBody.map((i) => i * gravityForce);
    return gravityForceVector; // kg * m / second == N
}
exports.default = {
    getUnitVectorFromThatBodyToThisBody,
    getGravityForceVectorOnThisBodyDueToThatBody,
};
//# sourceMappingURL=physics.js.map