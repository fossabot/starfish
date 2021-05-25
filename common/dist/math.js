"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lerp(v0 = 0, v1 = 0, t = 0) {
    return v0 * (1 - t) + v1 * t;
}
// roundTo:
// @param number (number) Initial number
// @param decimalPlaces (number) Number of decimal places to round to
// @param floor? (boolean) If true, uses floor instead of round.
//
function r2(// "round to"
number, decimalPlaces = 2, floor) {
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
function coordPairToRadians(coordPair = [0, 0]) {
    const [x, y] = coordPair;
    const angle = Math.atan2(y, x);
    return angle;
}
function vectorToDegrees(coordPair = [0, 0]) {
    const angle = coordPairToRadians(coordPair);
    const degrees = (180 * angle) / Math.PI; // degrees
    return (360 + degrees) % 360;
}
function distance(a = [0, 0], b = [0, 0]) {
    const c = a[0] - b[0];
    const d = a[1] - b[1];
    return Math.sqrt(c * c + d * d);
}
function angleFromAToB(a = [0, 0], b = [0, 0]) {
    return (((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) /
        Math.PI +
        360) %
        360);
}
/**
 * shortest distance (in degrees) between two angles.
 * It will be in range [0, 180].
 */
function angleDifference(a, b) {
    const c = Math.abs(b - a) % 360;
    const d = c > 180 ? 360 - c : c;
    return d;
}
function degreesToUnitVector(degrees = 0) {
    let rad = (Math.PI * degrees) / 180;
    let r = 1;
    return [r * Math.cos(rad), r * Math.sin(rad)];
}
function unitVectorFromThisPointToThatPoint(thisPoint = [0, 0], thatPoint = [0, 0]) {
    if (thisPoint[0] === thatPoint[0] &&
        thisPoint[1] === thatPoint[1])
        return [0, 0];
    const angleBetween = angleFromAToB(thisPoint, thatPoint);
    return degreesToUnitVector(angleBetween);
}
function vectorToMagnitude(vector = [0, 0]) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}
function pointIsInsideCircle(center = [0, 0], point = [1, 1], radius = 0) {
    return ((point[0] - center[0]) * (point[0] - center[0]) +
        (point[1] - center[1]) * (point[1] - center[1]) <=
        radius * radius);
}
function randomInsideCircle(radius) {
    const newCoords = () => {
        return [
            Math.random() * radius * 2 - radius,
            Math.random() * radius * 2 - radius,
        ];
    };
    let coords = newCoords();
    while (!pointIsInsideCircle([0, 0], coords, radius))
        coords = newCoords();
    return coords;
}
function randomSign() {
    return Math.random() > 0.5 ? 1 : -1;
}
function randomInRange(a, b) {
    const diff = b - a;
    return Math.random() * diff + a;
}
exports.default = {
    lerp,
    r2,
    radiansToDegrees,
    degreesToRadians,
    distance,
    angleFromAToB,
    angleDifference,
    randomInsideCircle,
    degreesToUnitVector,
    unitVectorFromThisPointToThatPoint,
    pointIsInsideCircle,
    vectorToDegrees,
    coordPairToRadians,
    vectorToMagnitude,
    randomSign,
    randomInRange,
};
//# sourceMappingURL=math.js.map