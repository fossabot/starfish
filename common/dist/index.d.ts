import { Profiler } from './Profiler';
import * as cargo from './cargo';
import stubify from './stubify';
import * as items from './items';
declare const _default: {
    items: typeof items;
    rooms: {
        bunk: BaseRoomData;
        cockpit: BaseRoomData;
        repair: BaseRoomData;
        weapons: BaseRoomData;
        mine: BaseRoomData;
    };
    crewActives: {
        boost: BaseCrewActiveData;
        quickFix: BaseCrewActiveData;
        sightRange: BaseCrewActiveData;
    };
    crewPassives: {
        cargoSpace: BaseCrewPassiveData;
    };
    cargo: typeof cargo;
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
    factions: {
        green: BaseFactionData;
        blue: BaseFactionData;
        purple: BaseFactionData;
        red: BaseFactionData;
    };
    basePassiveData: {
        boostDropAmount: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostDropRarity: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostScanRange: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostSightRange: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostBroadcastRange: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostRepairSpeed: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostRestSpeed: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostMineSpeed: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostBrake: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostCockpitChargeSpeed: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostXpGain: {
            toString: (p: ShipPassiveEffect) => string;
        };
        flatSkillBoost: {
            toString: (p: ShipPassiveEffect) => string;
        };
        scaledDamageReduction: {
            toString: (p: ShipPassiveEffect) => string;
        };
        flatDamageReduction: {
            toString: (p: ShipPassiveEffect) => string;
        };
        extraEquipmentSlots: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostCargoSpace: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostChassisAgility: {
            toString: (p: ShipPassiveEffect) => string;
        };
        disguiseCrewMemberCount: {
            toString: (p: ShipPassiveEffect) => string;
        };
        disguiseChassisType: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostAttackWithNumberOfFactionMembersWithinDistance: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostDamageToItemType: {
            toString: (p: ShipPassiveEffect) => string;
        };
        boostStaminaRegeneration: {
            toString: (p: ShipPassiveEffect) => string;
        };
    };
    Profiler: typeof Profiler;
    stubify: typeof stubify;
    discordBotId: string;
    discordBotPermissionsString: string;
    frontendUrl: string;
    discordBotInviteUrl: string;
    getUnitVectorFromThatBodyToThisBody: (thisBody: HasLocation, thatBody: HasLocation) => CoordinatePair;
    getGravityForceVectorOnThisBodyDueToThatBody: (thisBody: HasMassAndLocation, thatBody: HasMassAndLocation) => CoordinatePair;
    supportServerLink: string;
    gameShipLimit: number;
    gameSpeedMultiplier: number;
    damageMultiplier: number;
    baseSightRange: number;
    baseBroadcastRange: number;
    baseRepairCost: number;
    defaultHomeworldLevel: number;
    maxBroadcastLength: number;
    baseStaminaUse: number;
    baseXpGain: number;
    factionVendorMultiplier: number;
    factionAllegianceFriendCutoff: number;
    itemPriceMultiplier: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    aiDifficultyMultiplier: number;
    planetContributeCostPerXp: number;
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
        planet: ("planetType" | "name" | "color" | "location" | "radius" | "mass" | "landingRadiusMultiplier" | "level" | "xp" | "baseLevel" | "creatures" | "passives" | "pacifist" | "stats")[];
        faction: ("name" | "color" | "id" | "homeworld" | "ai" | "species")[];
        species: ("passives" | "id" | "icon" | "factionId" | "singular" | "description")[];
        chassis: ("mass" | "id" | "description" | "type" | "basePrice" | "displayName" | "slots" | "agility" | "maxCargoSpace" | "rarity")[];
    };
    sameFactionShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    getHitDamage: (weapon: WeaponStub, totalMunitionsSkill?: number) => number;
    getBaseDurabilityLossPerTick: (maxHp: number, reliability: number) => number;
    getRadiusDiminishingReturns: (totalValue: number, equipmentCount: number) => number;
    getRepairAmountPerTickForSingleCrewMember: (level: number) => number;
    getMineAmountPerTickForSingleCrewMember: (level: number) => number;
    brakeToThrustRatio: number;
    getMaxCockpitChargeForSingleCrewMember: (level?: number) => number;
    getCockpitChargePerTickForSingleCrewMember: (level?: number) => number;
    getThrustMagnitudeForSingleCrewMember: (level?: number, engineThrustMultiplier?: number) => number;
    baseEngineThrustMultiplier: number;
    getStaminaGainPerTickForSingleCrewMember: () => number;
    getWeaponCooldownReductionPerTick: (level: number) => number;
    getCrewPassivePriceMultiplier: (level: number) => number;
    tactics: Tactic[];
    baseCargoSellMultiplier: number;
    taglineOptions: string[];
    statToString: (data: {
        stat: string;
        amount: number;
    }) => string;
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
    getPlanetTitle: (planet: PlanetStub) => string;
    getPlanetPopulation: (planet: PlanetStub) => number;
    log: (...args: any[]) => void;
    trace: () => void;
    sleep: (ms: number) => Promise<void>;
    coinFlip: () => boolean;
    randomFromArray: <T>(array: T[]) => T;
    randomWithWeights: <E>(elements: {
        weight: number;
        value: E;
    }[]) => E;
    debounce: (fn: Function, time?: number) => (...params: any[]) => void;
    shuffleArray: (array: any[]) => any[];
    maxNameLength: number;
    numberWithCommas: (x: number) => string;
    printList: (list: string[]) => string;
    degreesToArrow: (angle: number) => string;
    coordPairToArrow: (coordPair: CoordinatePair) => string;
    numberToEmoji: (number?: number) => string;
    emojiToNumber: (emoji?: string) => number;
    capitalize: (string?: string) => string;
    camelCaseToWords: (string?: string, capitalizeFirst?: boolean | undefined) => string;
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
    gameName: string;
    gameDescription: string;
    tickInterval: number;
    mPerKm: number;
    kmPerAu: number;
    gravityRange: number;
    gravitationalConstant: number;
    lightspeed: number;
    deltaTime: number;
    arrivalThreshold: number;
    levels: number[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map