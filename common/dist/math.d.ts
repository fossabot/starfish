declare function lerp(v0?: number, v1?: number, t?: number): number;
declare function r2(// "round to"
number: number, decimalPlaces?: number, floor?: boolean): number;
declare function radiansToDegrees(radians?: number): number;
declare function degreesToRadians(degrees?: number): number;
declare function coordPairToRadians(coordPair?: CoordinatePair): number;
declare function vectorToDegrees(coordPair?: CoordinatePair): number;
declare function distance(a?: CoordinatePair, b?: CoordinatePair): number;
declare function angleFromAToB(a?: CoordinatePair, b?: CoordinatePair): number;
/**
 * shortest distance (in degrees) between two angles.
 * It will be in range [0, 180].
 */
declare function angleDifference(a: number, b: number): number;
declare function degreesToUnitVector(degrees?: number): CoordinatePair;
declare function vectorToUnitVector(vector?: CoordinatePair): CoordinatePair;
declare function unitVectorFromThisPointToThatPoint(thisPoint?: CoordinatePair, thatPoint?: CoordinatePair): CoordinatePair;
declare function vectorToMagnitude(vector?: CoordinatePair): number;
declare function pointIsInsideCircle(center?: CoordinatePair, point?: CoordinatePair, radius?: number): boolean;
declare function randomInsideCircle(radius: number): CoordinatePair;
declare function randomSign(): 1 | -1;
declare function randomInRange(a: number, b: number): number;
declare function lottery(odds: number, outOf: number): boolean;
declare const _default: {
    lerp: typeof lerp;
    r2: typeof r2;
    radiansToDegrees: typeof radiansToDegrees;
    degreesToRadians: typeof degreesToRadians;
    distance: typeof distance;
    angleFromAToB: typeof angleFromAToB;
    angleDifference: typeof angleDifference;
    randomInsideCircle: typeof randomInsideCircle;
    degreesToUnitVector: typeof degreesToUnitVector;
    vectorToUnitVector: typeof vectorToUnitVector;
    unitVectorFromThisPointToThatPoint: typeof unitVectorFromThisPointToThatPoint;
    pointIsInsideCircle: typeof pointIsInsideCircle;
    vectorToDegrees: typeof vectorToDegrees;
    coordPairToRadians: typeof coordPairToRadians;
    vectorToMagnitude: typeof vectorToMagnitude;
    randomSign: typeof randomSign;
    randomInRange: typeof randomInRange;
    lottery: typeof lottery;
};
export default _default;
//# sourceMappingURL=math.d.ts.map