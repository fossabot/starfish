"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function radiansToDegrees(radians) {
    return (180 * radians) / Math.PI;
}
function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}
function coordPairToRadians(coordPair) {
    const [x, y] = coordPair;
    const angle = Math.atan2(y, x);
    return angle;
}
function coordPairToDegrees(coordPair) {
    const angle = coordPairToRadians(coordPair);
    const degrees = (180 * angle) / Math.PI; // degrees
    return (360 + degrees) % 360;
}
function distance(a, b) {
    const c = a[0] - b[0];
    const d = a[1] - b[1];
    return Math.sqrt(c * c + d * d);
}
function angleFromAToB(a, b) {
    return (((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) /
        Math.PI +
        360) %
        360);
}
function degreesToUnitVector(degrees) {
    let rad = (Math.PI * degrees) / 180;
    let r = 1;
    return [r * Math.cos(rad), r * Math.sin(rad)];
}
function unitVectorFromThisPointToThatPoint(thisPoint, thatPoint) {
    if (thisPoint[0] === thatPoint[0] &&
        thisPoint[1] === thatPoint[1])
        return [0, 0];
    const angleBetween = angleFromAToB(thisPoint, thatPoint);
    return degreesToUnitVector(angleBetween);
}
function vectorToMagnitude(vector) {
    return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
}
function pointIsInsideCircle(center, point, radius) {
    return ((point[0] - center[0]) * (point[0] - center[0]) +
        (point[1] - center[1]) * (point[1] - center[1]) <=
        radius * radius);
}
exports.default = {
    radiansToDegrees,
    degreesToRadians,
    distance,
    angleFromAToB,
    degreesToUnitVector,
    unitVectorFromThisPointToThatPoint,
    pointIsInsideCircle,
    coordPairToDegrees,
    coordPairToRadians,
    vectorToMagnitude,
};
//# sourceMappingURL=math.js.map