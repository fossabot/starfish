declare function radiansToDegrees(radians: number): number;
declare function degreesToRadians(degrees: number): number;
declare function coordPairToRadians(coordPair: CoordinatePair): number;
declare function coordPairToDegrees(coordPair: CoordinatePair): number;
declare function distance(a: CoordinatePair, b: CoordinatePair): number;
declare function angleFromAToB(a: CoordinatePair, b: CoordinatePair): number;
declare function degreesToUnitVector(degrees: number): CoordinatePair;
declare function unitVectorFromThisPointToThatPoint(thisPoint: CoordinatePair, thatPoint: CoordinatePair): CoordinatePair;
declare function pointIsInsideCircle(center: CoordinatePair, point: CoordinatePair, radius: number): boolean;
declare const _default: {
    radiansToDegrees: typeof radiansToDegrees;
    degreesToRadians: typeof degreesToRadians;
    distance: typeof distance;
    angleFromAToB: typeof angleFromAToB;
    degreesToUnitVector: typeof degreesToUnitVector;
    unitVectorFromThisPointToThatPoint: typeof unitVectorFromThisPointToThatPoint;
    pointIsInsideCircle: typeof pointIsInsideCircle;
    coordPairToDegrees: typeof coordPairToDegrees;
    coordPairToRadians: typeof coordPairToRadians;
};
export default _default;
//# sourceMappingURL=math.d.ts.map