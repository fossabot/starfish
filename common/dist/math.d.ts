declare function lerp(v0?: number, v1?: number, t?: number): number;
declare function radiansToDegrees(radians?: number): number;
declare function degreesToRadians(degrees?: number): number;
declare function coordPairToRadians(coordPair?: CoordinatePair): number;
declare function vectorToDegrees(coordPair?: CoordinatePair): number;
declare function distance(a?: CoordinatePair, b?: CoordinatePair): number;
declare function angleFromAToB(a?: CoordinatePair, b?: CoordinatePair): number;
declare function degreesToUnitVector(degrees?: number): CoordinatePair;
declare function unitVectorFromThisPointToThatPoint(thisPoint?: CoordinatePair, thatPoint?: CoordinatePair): CoordinatePair;
declare function vectorToMagnitude(vector?: CoordinatePair): number;
declare function pointIsInsideCircle(center?: CoordinatePair, point?: CoordinatePair, radius?: number): boolean;
declare const _default: {
    lerp: typeof lerp;
    radiansToDegrees: typeof radiansToDegrees;
    degreesToRadians: typeof degreesToRadians;
    distance: typeof distance;
    angleFromAToB: typeof angleFromAToB;
    degreesToUnitVector: typeof degreesToUnitVector;
    unitVectorFromThisPointToThatPoint: typeof unitVectorFromThisPointToThatPoint;
    pointIsInsideCircle: typeof pointIsInsideCircle;
    vectorToDegrees: typeof vectorToDegrees;
    coordPairToRadians: typeof coordPairToRadians;
    vectorToMagnitude: typeof vectorToMagnitude;
};
export default _default;
//# sourceMappingURL=math.d.ts.map