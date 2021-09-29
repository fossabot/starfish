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
    crewPassives: {
        cargoSpace: CrewPassiveData;
        boostCockpitChargeSpeed: CrewPassiveData;
        boostThrust: CrewPassiveData;
        boostMineSpeed: CrewPassiveData;
        boostRepairSpeed: CrewPassiveData;
        boostWeaponChargeSpeed: CrewPassiveData;
        boostStaminaRegeneration: CrewPassiveData;
        boostXpGain: CrewPassiveData;
        generalImprovementWhenAlone: CrewPassiveData;
        generalImprovementPerCrewMemberInSameRoom: CrewPassiveData;
        boostDropAmounts: CrewPassiveData;
        boostBroadcastRange: CrewPassiveData;
        lessDamageOnEquipmentUse: CrewPassiveData;
        boostBrake: CrewPassiveData;
    };
    cargo: typeof cargo;
    species: {
        octopi: BaseSpeciesData;
        lobsters: BaseSpeciesData;
        crabs: BaseSpeciesData;
        "sea turtles": BaseSpeciesData;
        sharks: BaseSpeciesData;
        dolphins: BaseSpeciesData;
        whales: BaseSpeciesData;
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
    baseShipPassiveData: {
        boostCockpitChargeSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostMineSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostRepairSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostStaminaRegeneration: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostXpGain: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostBroadcastRange: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostBrake: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDropAmount: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDropRarity: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostScanRange: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostSightRange: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostMinePayouts: {
            description: (p: ShipPassiveEffect) => string;
        };
        flatSkillBoost: {
            description: (p: ShipPassiveEffect) => string;
        };
        scaledDamageReduction: {
            description: (p: ShipPassiveEffect) => string;
        };
        flatDamageReduction: {
            description: (p: ShipPassiveEffect) => string;
        };
        extraEquipmentSlots: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostCargoSpace: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostChassisAgility: {
            description: (p: ShipPassiveEffect) => string;
        };
        disguiseCrewMemberCount: {
            description: (p: ShipPassiveEffect) => string;
        };
        disguiseChassisType: {
            description: (p: ShipPassiveEffect) => string;
        };
        alwaysSeeTrailColors: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamage: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageWhenNoAlliesWithinDistance: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageWithNumberOfFactionMembersWithinDistance: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageToItemType: {
            description: (p: ShipPassiveEffect) => string;
        };
        autoRepair: {
            description: (p: ShipPassiveEffect) => string;
        };
    };
    Profiler: typeof Profiler;
    stubify: typeof stubify;
    discordBotId: string;
    discordBotPermissionsString: string;
    frontendUrl: string;
    discordBotInviteUrl: string;
    getUnitVectorFromThatBodyToThisBody: (thisBody: HasLocation, thatBody: HasLocation) => CoordinatePair;
    getGravityForceVectorOnThisBodyDueToThatBody: (thisBody: HasMassAndLocation, thatBody: HasMassAndLocation, gravityScalingFunction?: string, gravityMultiplier?: number, gravityRange?: number) => CoordinatePair;
    supportServerLink: string;
    gameSpeedMultiplier: number;
    baseSightRange: number;
    baseBroadcastRange: number;
    baseRepairCost: number;
    defaultHomeworldLevel: number;
    maxBroadcastLength: number;
    factionVendorMultiplier: number;
    factionAllegianceFriendCutoff: number;
    userIsOfflineTimeout: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    planetContributeCostPerXp: number;
    planetLevelXpRequirementMultiplier: number;
    itemPriceMultiplier: number;
    weaponDamageMultiplier: number;
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
        species: ("passives" | "id" | "icon" | "aiOnly" | "singular" | "description")[];
        chassis: ("mass" | "passives" | "id" | "description" | "type" | "basePrice" | "displayName" | "slots" | "agility" | "maxCargoSpace" | "rarity")[];
    };
    sameFactionShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    getHitDamage: (weapon: WeaponStub, totalMunitionsSkill?: number) => number;
    getBaseDurabilityLossPerTick: (maxHp: number, reliability: number, useLevel?: number) => number;
    getRadiusDiminishingReturns: (totalValue: number, equipmentCount: number) => number;
    getRepairAmountPerTickForSingleCrewMember: (level: number) => number;
    getMineAmountPerTickForSingleCrewMember: (level: number) => number;
    getMaxCockpitChargeForSingleCrewMember: (level?: number) => number;
    getCockpitChargePerTickForSingleCrewMember: (level?: number) => number;
    getThrustMagnitudeForSingleCrewMember: (level: number | undefined, engineThrustMultiplier: number | undefined, baseEngineThrustMultiplier: number) => number;
    getStaminaGainPerTickForSingleCrewMember: (baseStaminaUse: number) => number;
    getWeaponCooldownReductionPerTick: (level: number) => number;
    getCrewPassivePriceMultiplier: (level: number) => number;
    tactics: CombatTactic[];
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
    getCargoSellPrice: (cargoId: CargoId, planet: PlanetStub, amount: number, factionId: FactionId) => number;
    getCargoBuyPrice: (cargoId: CargoId, planet: PlanetStub, amount: number, factionId: FactionId) => number;
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
    numberWithCommas: (x: number) => string | number;
    printList: (list: string[]) => string;
    degreesToArrow: (angle: number) => string;
    degreesToArrowEmoji: (angle: number) => string;
    coordPairToArrow: (coordPair: CoordinatePair) => string;
    percentToTextBars: (percent?: number, barCount?: number) => string;
    numberToEmoji: (number?: number) => string;
    emojiToNumber: (emoji?: string) => number;
    capitalize: (string?: string) => string;
    camelCaseToWords: (string?: string, capitalizeFirst?: boolean | undefined) => string;
    sanitize: (string?: string) => SanitizeResult;
    msToTimeString: (ms?: number) => string;
    garble: (string?: string, percent?: number) => string;
    acronym: (string?: string) => string;
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
    gravitationalConstant: number;
    lightspeed: number;
    deltaTime: number;
    levels: number[];
};
export default _default;
//# sourceMappingURL=index.d.ts.map