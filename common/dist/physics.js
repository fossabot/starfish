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
    if (!thisBody || !thatBody || !thisBody.mass || !thatBody.mass)
        return [0, 0];
    const m1 = thisBody.mass || 0;
    const m2 = thatBody.mass || 0;
    const r = Math.min(globals_1.default.gravityRange, math_1.default.distance(thisBody.location, thatBody.location)) *
        globals_1.default.kmPerAu *
        globals_1.default.mPerKm;
    if (r === 0)
        return [0, 0];
    // const scalingFunction = (
    //   rangeInMeters,
    //   massProduct: number,
    // ) =>
    //   0.0001 *
    //   Math.sqrt(globals.gravitationalConstant * massProduct) *
    //   (rangeInMeters /
    //     (globals.gravityRange *
    //       globals.kmPerAu *
    //       globals.mPerKm))
    // const gravityForce = scalingFunction(r, m1 * m2)
    // real formula is (-globals.gravitationalConstant * m1 * m2) / r ** 2
    // // * to make gravity feel more 'forceful', we're letting it have an effect over a larger zone
    const gravityScaleFactor = 0.25;
    // const gravityForce =
    // (-globals.gravitationalConstant * m1 * m2) / Math.abs(r) * gravityScaleFactor
    const gravityForce = ((-globals_1.default.gravitationalConstant * m1 * m2) / r ** 2) * gravityScaleFactor;
    const vectorToThisBody = getUnitVectorFromThatBodyToThisBody(thisBody, thatBody);
    const gravityForceVector = vectorToThisBody.map((i) => i * gravityForce);
    // if (gravityForce < -1012223) console.log(gravityForce)
    return gravityForceVector; // kg * m / second == N
}
exports.default = {
    getUnitVectorFromThatBodyToThisBody,
    getGravityForceVectorOnThisBodyDueToThatBody,
};
//# sourceMappingURL=physics.js.map