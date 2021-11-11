"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lerp(v0 = 0, v1 = 1, t = 0.5) {
    return v0 * (1 - t) + v1 * t;
}
function clamp(lowerBound = 0, n = 0, upperBound = 1) {
    return Math.min(Math.max(lowerBound, n), upperBound);
}
// roundTo:
// @param number (number) Initial number
// @param decimalPlaces (number) Number of decimal places to round to
// @param floor? (boolean) If true, uses floor instead of round.
//
function r2(// "round to"
number = 0, decimalPlaces = 2, floor) {
    if (floor)
        return (Math.floor(number * 10 ** decimalPlaces) /
            10 ** decimalPlaces);
    return (Math.round(number * 10 ** decimalPlaces) /
        10 ** decimalPlaces);
}
function radiansToDegrees(radians = 0) {
    return (180 * radians) / Math.PI;
}
function degreesToRadians(degrees = 0) {
    return (degrees * Math.PI) / 180;
}
function vectorToRadians(coordPair = [0, 0]) {
    const [x, y] = coordPair;
    const angle = Math.atan2(y || 0, x || 0);
    return angle;
}
function vectorToDegrees(coordPair = [0, 0]) {
    const angle = vectorToRadians(coordPair);
    const degrees = (180 * angle) / Math.PI;
    return (360 + degrees) % 360;
}
function distance(a = [0, 0], b = [0, 0]) {
    const c = (a[0] || 0) - (b[0] || 0);
    const d = (a[1] || 0) - (b[1] || 0);
    return Math.sqrt(c * c + d * d);
}
/**
 * distance in degrees [0, 360] between two angles
 */
function angleFromAToB(a = [0, 0], b = [0, 0]) {
    return (((Math.atan2((b[1] || 0) - (a[1] || 0), (b[0] || 0) - (a[0] || 0)) *
        180) /
        Math.PI +
        360) %
        360);
}
function mirrorAngleVertically(angle = 0) {
    return (180 - angle + 360) % 360;
}
/**
 * shortest distance (in degrees) between two angles.
 * It will be in range [0, 180] if not signed.
 */
function angleDifference(a = 0, b = 0, signed = false) {
    if (signed) {
        const d = Math.abs(a - b) % 360;
        let r = d > 180 ? 360 - d : d;
        // calculate sign
        const sign = (a - b >= 0 && a - b <= 180) ||
            (a - b <= -180 && a - b >= -360)
            ? 1
            : -1;
        r *= sign;
        return r;
    }
    const c = Math.abs(b - a) % 360;
    const d = c > 180 ? 360 - c : c;
    return d;
}
function degreesToUnitVector(degrees = 0) {
    let rad = (Math.PI * degrees) / 180;
    let r = 1;
    return [r * Math.cos(rad), r * Math.sin(rad)];
}
function vectorToUnitVector(vector = [0, 0]) {
    const magnitude = vectorToMagnitude(vector);
    if (magnitude === 0)
        return [0, 0];
    return [
        (vector[0] || 0) / magnitude,
        (vector[1] || 0) / magnitude,
    ];
}
function unitVectorFromThisPointToThatPoint(thisPoint = [0, 0], thatPoint = [0, 0]) {
    if ((thisPoint[0] || 0) === (thatPoint[0] || 0) &&
        (thisPoint[1] || 0) === (thatPoint[1] || 0))
        return [0, 0];
    const angleBetween = angleFromAToB(thisPoint, thatPoint);
    return degreesToUnitVector(angleBetween);
}
function vectorToMagnitude(vector = [0, 0]) {
    return Math.sqrt((vector[0] || 0) * (vector[0] || 0) +
        (vector[1] || 0) * (vector[1] || 0));
}
function vectorFromDegreesAndMagnitude(angle = 0, magnitude = 1) {
    const rad = (Math.PI * angle) / 180;
    return [
        magnitude * Math.cos(rad),
        magnitude * Math.sin(rad),
    ];
}
function pointIsInsideCircle(center = [0, 0], point = [1, 1], radius = 0) {
    return (((point[0] || 0) - (center[0] || 0)) *
        ((point[0] || 0) - (center[0] || 0)) +
        ((point[1] || 0) - (center[1] || 0)) *
            ((point[1] || 0) - (center[1] || 0)) <=
        radius * radius);
}
function randomInsideCircle(radius) {
    const newCoords = () => {
        return [
            Math.random() * (radius || 0) * 2 - (radius || 0),
            Math.random() * (radius || 0) * 2 - (radius || 0),
        ];
    };
    let coords = newCoords();
    while (!pointIsInsideCircle([0, 0], coords, radius || 0))
        coords = newCoords();
    return coords;
}
function randomSign() {
    return Math.random() > 0.5 ? 1 : -1;
}
function randomInRange(a = 0, b = 1) {
    const diff = b - a;
    return Math.random() * diff + a;
}
function lottery(odds = 1, outOf = 10) {
    return Math.random() < odds / outOf;
}
function randomBetween(start = 1, end = 10) {
    const lesser = Math.min(start, end);
    const greater = Math.max(start, end);
    const diff = greater - lesser;
    return Math.random() * diff + lesser;
}
exports.default = {
    lerp,
    clamp,
    r2,
    radiansToDegrees,
    degreesToRadians,
    distance,
    angleFromAToB,
    mirrorAngleVertically,
    angleDifference,
    randomInsideCircle,
    degreesToUnitVector,
    vectorToUnitVector,
    unitVectorFromThisPointToThatPoint,
    pointIsInsideCircle,
    vectorToDegrees,
    coordPairToRadians: vectorToRadians,
    vectorToMagnitude,
    vectorFromDegreesAndMagnitude,
    randomSign,
    randomInRange,
    lottery,
    randomBetween,
};
//# sourceMappingURL=math.js.map