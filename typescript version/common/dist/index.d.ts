declare const _default: {
    log: (...args: any[]) => void;
    randomFromArray: (array: any[]) => any;
    degreesToArrow: (angle: number) => string;
    coordPairToArrow: (coordPair: CoordinatePair) => string;
    percentToTextBars: (percent: number, barCount?: number) => string;
    numberToEmoji: (number: number) => string;
    emojiToNumber: (emoji: string) => number;
    capitalize: (string: string) => string;
    sanitize: (string: string) => SanitizeResult;
    msToTimeString: (ms: number) => string;
    garble: (string: string, percent?: number) => string;
    radiansToDegrees: (radians: number) => number;
    degreesToRadians: (degrees: number) => number;
    distance: (a: CoordinatePair, b: CoordinatePair) => number;
    angleFromAToB: (a: CoordinatePair, b: CoordinatePair) => number;
    degreesToUnitVector: (degrees: number) => CoordinatePair;
    unitVectorFromThisPointToThatPoint: (thisPoint: CoordinatePair, thatPoint: CoordinatePair) => CoordinatePair;
    pointIsInsideCircle: (center: CoordinatePair, point: CoordinatePair, radius: number) => boolean;
    coordPairToDegrees: (coordPair: CoordinatePair) => number;
    coordPairToRadians: (coordPair: CoordinatePair) => number;
    GAME_NAME: string;
    TICK_INTERVAL: number;
    TEST: number;
};
export default _default;
//# sourceMappingURL=index.d.ts.map