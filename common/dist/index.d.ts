declare const _default: {
    getUnitVectorFromThatBodyToThisBody: (thisBody: HasLocation, thatBody: HasLocation) => CoordinatePair;
    getGravityForceVectorOnThisBodyDueToThatBody: (thisBody: HasMassAndLocation, thatBody: HasMassAndLocation) => CoordinatePair;
    gameSpeedMultiplier: number;
    baseRepairCost: number;
    maxBroadcastLength: number;
    getRepairAmountPerTickForSingleCrewMember: (skill: number) => number;
    getThrustMagnitudeForSingleCrewMember: (skill?: number, engineThrustMultiplier?: number) => number;
    getStaminaGainPerTickForSingleCrewMember: () => number;
    getWeaponCooldownReductionPerTick: (level: number) => number;
    tactics: Tactic[];
    cargoTypes: (CargoType | "credits")[];
    stubify: <BaseType, StubType extends BaseStub>(prop: BaseType, disallowPropName?: string[] | undefined) => StubType;
    log: (...args: any[]) => void;
    sleep: (ms: number) => Promise<void>;
    coinFlip: () => boolean;
    randomFromArray: (array: any[]) => any;
    maxNameLength: number;
    numberWithCommas: (x: number) => string;
    degreesToArrow: (angle: number) => string;
    coordPairToArrow: (coordPair: CoordinatePair) => string;
    percentToTextBars: (percent?: number, barCount?: number) => string;
    numberToEmoji: (number?: number) => string;
    emojiToNumber: (emoji?: string) => number;
    capitalize: (string?: string) => string;
    sanitize: (string?: string) => SanitizeResult;
    msToTimeString: (ms?: number) => string;
    garble: (string?: string, percent?: number) => string;
    lerp: (v0?: number, v1?: number, t?: number) => number;
    r2: (number: number, decimalPlaces?: number, floor?: boolean | undefined) => number;
    radiansToDegrees: (radians?: number) => number;
    degreesToRadians: (degrees?: number) => number;
    distance: (a?: CoordinatePair, b?: CoordinatePair) => number;
    angleFromAToB: (a?: CoordinatePair, b?: CoordinatePair) => number;
    angleDifference: (a: number, b: number) => number;
    randomInsideCircle: (radius: number) => CoordinatePair;
    degreesToUnitVector: (degrees?: number) => CoordinatePair;
    unitVectorFromThisPointToThatPoint: (thisPoint?: CoordinatePair, thatPoint?: CoordinatePair) => CoordinatePair;
    pointIsInsideCircle: (center?: CoordinatePair, point?: CoordinatePair, radius?: number) => boolean;
    vectorToDegrees: (coordPair?: CoordinatePair) => number;
    coordPairToRadians: (coordPair?: CoordinatePair) => number;
    vectorToMagnitude: (vector?: CoordinatePair) => number;
    randomSign: () => 1 | -1;
    randomInRange: (a: number, b: number) => number;
    GAME_NAME: string;
    TICK_INTERVAL: number;
    M_PER_KM: number;
    KM_PER_AU: number;
    GRAVITY_RANGE: number;
    GRAVITATIONAL_CONSTANT: number;
    LIGHTSPEED: number;
    deltaTime: number;
    ARRIVAL_THRESHOLD: number;
    levels: number[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map