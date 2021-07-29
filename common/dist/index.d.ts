import { Profiler } from './Profiler';
declare const _default: {
    species: {
        octopi: BaseSpeciesData;
        squids: BaseSpeciesData;
        lobsters: BaseSpeciesData;
        crabs: BaseSpeciesData;
        seals: BaseSpeciesData;
        "sea turtles": BaseSpeciesData;
        dolphins: BaseSpeciesData;
        whales: BaseSpeciesData;
        tuna: BaseSpeciesData;
        angelfish: BaseSpeciesData;
        blowfish: BaseSpeciesData;
        shrimp: BaseSpeciesData;
        eagles: BaseSpeciesData;
        seagulls: BaseSpeciesData;
        chickens: BaseSpeciesData;
        flamingos: BaseSpeciesData;
    };
    basePassiveData: {
        boostDropAmount: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostDropRarity: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostScanRange: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostSightRange: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostBroadcastRange: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostRepairSpeed: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostRestSpeed: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostCockpitChargeSpeed: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostXpGain: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        flatSkillBoost: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        addBaseArmor: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        flatDamageReduction: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        extraEquipmentSlots: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostCargoSpace: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostChassisAgility: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        disguiseCrewMemberCount: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        disguiseChassisType: {
            toString: (intensity: number, ...args: any[]) => string;
        };
        boostAttackWithNumberOfFactionMembersWithinDistance: {
            toString: (intensity: number, ...args: any[]) => string;
        };
    };
    Profiler: typeof Profiler;
    discordBotId: string;
    discordBotPermissionsString: string;
    frontendUrl: string;
    discordBotInviteUrl: string;
    getUnitVectorFromThatBodyToThisBody: (thisBody: HasLocation, thatBody: HasLocation) => CoordinatePair;
    getGravityForceVectorOnThisBodyDueToThatBody: (thisBody: HasMassAndLocation, thatBody: HasMassAndLocation) => CoordinatePair;
    gameShipLimit: number;
    gameSpeedMultiplier: number;
    baseSightRange: number;
    baseRepairCost: number;
    maxBroadcastLength: number;
    baseStaminaUse: number;
    baseXpGain: number;
    factionVendorMultiplier: number;
    factionAllegianceFriendCutoff: number;
    itemPriceMultiplier: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    aiDifficultyMultiplier: number;
    attackRemnantExpireTime: number;
    cacheExpireTime: number;
    baseShipScanProperties: {
        id: true;
        name: true;
        human: true;
        ai: true;
        headerBackground: true;
        tagline: true;
        level: true;
        dead: true;
        attackable: true;
        previousLocations: true;
        location: true;
        planet: (keyof BasePlanetData)[];
        faction: (keyof BaseFactionData)[];
        species: (keyof BaseSpeciesData)[];
        chassis: (keyof BaseChassisData)[];
    };
    sameFactionShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    getHitDamage: (weapon: WeaponStub, totalMunitionsSkill?: number) => number;
    getBaseDurabilityLossPerTick: (maxHp: number, reliability: number) => number;
    getRadiusDiminishingReturns: (totalValue: number, equipmentCount: number) => number;
    getRepairAmountPerTickForSingleCrewMember: (level: number) => number;
    getMaxCockpitChargeForSingleCrewMember: (level?: number) => number;
    getCockpitChargePerTickForSingleCrewMember: (level?: number) => number;
    getThrustMagnitudeForSingleCrewMember: (level?: number, engineThrustMultiplier?: number) => number;
    getStaminaGainPerTickForSingleCrewMember: () => number;
    getWeaponCooldownReductionPerTick: (level: number) => number;
    getCrewPassivePriceMultiplier: (level: number) => number;
    tactics: Tactic[];
    cargoTypes: (CargoType | "credits")[];
    taglineOptions: string[];
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
    stubify: <BaseType, StubType extends BaseStub>(prop: BaseType, disallowPropName?: string[] | undefined) => StubType;
    log: (...args: any[]) => void;
    trace: () => void;
    sleep: (ms: number) => Promise<void>;
    coinFlip: () => boolean;
    randomFromArray: (array: any[]) => any;
    debounce: (fn: Function, time?: number) => (...params: any[]) => void;
    shuffleArray: (array: any[]) => any[];
    maxNameLength: number;
    numberWithCommas: (x: number) => string;
    printList: (list: string[]) => string;
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
    angleDifference: (a: number, b: number, signed?: boolean) => number;
    randomInsideCircle: (radius: number) => CoordinatePair;
    degreesToUnitVector: (degrees?: number) => CoordinatePair;
    vectorToUnitVector: (vector?: CoordinatePair) => CoordinatePair;
    unitVectorFromThisPointToThatPoint: (thisPoint?: CoordinatePair, thatPoint?: CoordinatePair) => CoordinatePair;
    pointIsInsideCircle: (center?: CoordinatePair, point?: CoordinatePair, radius?: number) => boolean;
    vectorToDegrees: (coordPair?: CoordinatePair) => number;
    coordPairToRadians: (coordPair?: CoordinatePair) => number;
    vectorToMagnitude: (vector?: CoordinatePair) => number;
    randomSign: () => 1 | -1;
    randomInRange: (a: number, b: number) => number;
    lottery: (odds: number, outOf: number) => boolean;
    randomBetween: (start: number, end: number) => number;
    GAME_NAME: string;
    GAME_DESCRIPTION: string;
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