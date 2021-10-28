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
const scalingFunctions = {
    defaultRealGravity: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => (-globals_1.default.gravitationalConstant * massProduct) /
        rangeInMeters ** 2,
    flexibleExponent: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, gravityScalingExponent, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (rangeAsPercentOfGravityRadius - 1) **
            (gravityScalingExponent * 2),
    // this one is okay, it just feels like faraway planets are very strong even when you're right next to another planet
    linear: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (1 - rangeAsPercentOfGravityRadius),
    // middle ground between linear and exponential
    quadratic: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (rangeAsPercentOfGravityRadius - 1) ** 2,
    // stronger lean towards exponential
    cubic: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (-1 * (rangeAsPercentOfGravityRadius - 1) ** 3),
    // even stronger lean towards exponential
    sixthPower: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (rangeAsPercentOfGravityRadius - 1) ** 6,
    // even stronger lean towards exponential
    tenthPower: ({ massProduct, rangeInMeters, rangeAsPercentOfGravityRadius, }) => -1 *
        0.0000015 *
        Math.sqrt(globals_1.default.gravitationalConstant * massProduct) *
        (rangeAsPercentOfGravityRadius - 1) ** 10,
};
function getGravityForceVectorOnThisBodyDueToThatBody(thisBody, thatBody, gravityScalingExponent = 10, gravityMultiplier = 1, gravityRange = 0.5) {
    if (!thisBody ||
        !thatBody ||
        !thisBody.mass ||
        !thatBody.mass)
        return [0, 0];
    const m1 = thisBody.mass || 0;
    const m2 = thatBody.mass || 0;
    const massProduct = m1 * m2;
    const rangeInMeters = Math.min(gravityRange, math_1.default.distance(thisBody.location, thatBody.location)) *
        globals_1.default.kmPerAu *
        globals_1.default.mPerKm;
    const rangeAsPercentOfGravityRadius = rangeInMeters /
        (gravityRange * globals_1.default.kmPerAu * globals_1.default.mPerKm);
    if (rangeInMeters === 0)
        return [0, 0];
    // * gives a percentage 0 (thisBody is moving perfectly toawrds/straight away from thatBody), to 1 (thisBody is moving perfectly perpendicular to thatBody)
    const angleToThatBody = Math.abs(Math.abs(math_1.default.angleDifference(math_1.default.vectorToDegrees(thisBody.velocity), math_1.default.angleFromAToB(thatBody.location, thisBody.location)) - 90) - 90) / 90;
    const maxGravityLesseningEffectPercentage = 0.85;
    const coneWidth = 0.15;
    let gravityLesseningEffectPercentage = 0;
    if (angleToThatBody < coneWidth &&
        maxGravityLesseningEffectPercentage > 0) {
        gravityLesseningEffectPercentage = math_1.default.lerp(0, maxGravityLesseningEffectPercentage, 1 - angleToThatBody / coneWidth);
    }
    // * ----- current scaling function in use -----
    const scalingFunction = scalingFunctions.flexibleExponent ||
        scalingFunctions.defaultRealGravity;
    // * ----- final gravity force calc -----
    const gravityForce = scalingFunction({
        massProduct,
        rangeInMeters,
        rangeAsPercentOfGravityRadius,
        gravityScalingExponent: Math.round(gravityScalingExponent),
    }) *
        gravityMultiplier *
        (1 - gravityLesseningEffectPercentage);
    // c.log({
    //   name: thatBody.name,
    //   gravityScalingExponent,
    //   rangeAsPercentOfGravityRadius,
    //   angleToThatBody,
    //   gravityLesseningEffectPercentage,
    //   gravityForce: gravityForce / 10000,
    // })
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