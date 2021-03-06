import * as cargo from './cargo';
import stubify from './stubify';
import * as items from './items';
declare const _default: {
    items: typeof items;
    achievements: {
        [key: string]: Achievement;
    };
    rooms: {
        bunk: BaseRoomData;
        cockpit: BaseRoomData;
        repair: BaseRoomData;
        weapons: BaseRoomData;
        mine: BaseRoomData;
        lab: BaseRoomData;
        lounge: BaseRoomData;
    };
    crewPassives: {
        boostWeaponChargeSpeed: CrewPassiveData;
        boostStrength: CrewPassiveData;
        boostDexterity: CrewPassiveData;
        boostIntellect: CrewPassiveData;
        boostCharisma: CrewPassiveData;
        boostThrust: CrewPassiveData;
        boostMineSpeed: CrewPassiveData;
        boostRepairSpeed: CrewPassiveData;
        generalImprovementWhenAlone: CrewPassiveData;
        generalImprovementPerCrewMemberInSameRoom: CrewPassiveData;
        boostSkillLevel: CrewPassiveData;
        cargoSpace: CrewPassiveData;
        boostCockpitChargeSpeed: CrewPassiveData;
        boostPassiveThrust: CrewPassiveData;
        boostStaminaRegeneration: CrewPassiveData;
        reduceStaminaDrain: CrewPassiveData;
        boostMaxStamina: CrewPassiveData;
        boostXpGain: CrewPassiveData;
        boostDropAmounts: CrewPassiveData;
        boostBroadcastRange: CrewPassiveData;
        lessDamageOnEquipmentUse: CrewPassiveData;
        boostBrake: CrewPassiveData;
        boostEndurance: CrewPassiveData;
        boostActiveSlots: CrewPassiveData;
        boostMoraleGain: CrewPassiveData;
    };
    cargo: typeof cargo;
    species: {
        eagles: BaseSpeciesData;
        seagulls: BaseSpeciesData;
        chickens: BaseSpeciesData;
        flamingos: BaseSpeciesData;
        vultures: BaseSpeciesData;
        octopi: BaseSpeciesData;
        lobsters: BaseSpeciesData;
        crabs: BaseSpeciesData;
        "sea turtles": BaseSpeciesData;
        sharks: BaseSpeciesData;
        dolphins: BaseSpeciesData;
        snails: BaseSpeciesData;
        whales: BaseSpeciesData;
        angelfish: BaseSpeciesData;
        blowfish: BaseSpeciesData;
        shrimp: BaseSpeciesData;
    };
    guilds: {
        fowl: BaseGuildData;
        trader: BaseGuildData;
        hunter: BaseGuildData;
        miner: BaseGuildData;
        explorer: BaseGuildData;
        peacekeeper: BaseGuildData;
    };
    baseShipPassiveData: {
        boostWeaponChargeSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostThrust: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostMineSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostRepairSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        flatDamageReduction: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostChassisAgility: {
            description: (p: ShipPassiveEffect) => string;
        };
        attacksSlow: {
            description: (p: ShipPassiveEffect) => string;
        };
        broadcastRangeCargoPrices: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostCockpitChargeSpeed: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostPassiveThrust: {
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
        boostMoraleGain: {
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
        extraEquipmentSlots: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostCargoSpace: {
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
        boostAccuracy: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamage: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageWhenNoAlliesWithinDistance: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageWithNumberOfGuildMembersWithinDistance: {
            description: (p: ShipPassiveEffect) => string;
        };
        boostDamageToItemType: {
            description: (p: ShipPassiveEffect) => string;
        };
        autoRepair: {
            description: (p: ShipPassiveEffect) => string;
        };
        visibleCargoPrices: {
            description: (p: ShipPassiveEffect) => string;
        };
    };
    loadouts: {
        tutorial1: Loadout;
        tutorial2: Loadout;
        humanDefault: Loadout;
        aiTutorial1: Loadout;
        testManualEngine: Loadout;
        testPassiveEngine: Loadout;
        testMega: Loadout;
        testSlowingWeapon: Loadout;
    };
    massProfiler: import("./massProfiler").MassProfiler;
    stubify: typeof stubify;
    getActiveIntensityScaledByLevel(intensity: number, level: number): number;
    crewActiveBaseGlobalCooldown: number;
    activeUnlockLevels: number[];
    crewActives: {
        instantStamina: CrewActiveData;
        cargoSweep: CrewActiveData;
        boostShipSightRange: CrewActiveData;
        repairDrone: CrewActiveData;
        combatDrone: CrewActiveData;
        boostWeaponChargeSpeed: CrewActiveData;
        boostStrength: CrewActiveData;
        boostDexterity: CrewActiveData;
        boostIntellect: CrewActiveData;
        boostCharisma: CrewActiveData;
        boostMorale: CrewActiveData;
        boostThrust: CrewActiveData;
        boostMineSpeed: CrewActiveData;
        boostRepairSpeed: CrewActiveData;
        generalImprovementWhenAlone: CrewActiveData;
        generalImprovementPerCrewMemberInSameRoom: CrewActiveData;
        fullCrewSkillBoost: CrewActiveData;
        flatDamageReduction: CrewActiveData;
        boostChassisAgility: CrewActiveData;
        seeTrailColors: CrewActiveData;
        attacksSlow: CrewActiveData;
        boostDamageToEngines: CrewActiveData;
        boostDamageToWeapons: CrewActiveData;
        boostDamageToScanners: CrewActiveData;
        broadcastRangeCargoPrices: CrewActiveData;
        damageToAllNearbyEnemies: CrewActiveData;
        moveAllCrewMembersToRepair: CrewActiveData;
    };
    getShipTaglinePrice(cosmetic: PlanetShipCosmetic): Price;
    getShipBackgroundPrice(cosmetic: PlanetShipCosmetic): Price;
    getCrewTaglinePrice(cosmetic: PlanetCrewCosmetic): Price;
    getCrewBackgroundPrice(cosmetic: PlanetCrewCosmetic): Price;
    baseShipTaglinePrice: 2;
    baseShipBackgroundPrice: 3;
    baseCrewTaglinePrice: 1000;
    baseCrewBackgroundPrice: 2000;
    buyableShipBackgrounds: {
        rarity: number;
        value: ShipBackground;
    }[];
    buyableShipTaglines: {
        rarity: number;
        value: string;
    }[];
    buyableCrewBackgrounds: {
        rarity: number;
        value: CrewBackground;
    }[];
    buyableCrewTaglines: {
        rarity: number;
        value: string;
    }[];
    discordBotId: string;
    discordBotPermissionsString: string;
    frontendUrl: string;
    discordBotInviteUrl: string;
    getUnitVectorFromThatBodyToThisBody: (thisBody: HasLocation, thatBody: HasLocation) => CoordinatePair;
    getGravityForceVectorOnThisBodyDueToThatBody: (thisBody: HasMassAndLocationAndVelocity, thatBody: HasMassAndLocation, gravityScalingExponent?: number, gravityMultiplier?: number, gravityRange?: number) => CoordinatePair;
    defaultGameSettings: {
        id: any;
        humanShipLimit: any;
        safeZoneRadius: any;
        contractLocationRadius: any;
        aiDifficultyMultiplier: any;
        baseXpGain: any;
        baseStaminaUse: any;
        brakeToThrustRatio: any;
        baseEngineThrustMultiplier: any;
        gravityMultiplier: any;
        gravityCurveSteepness: any;
        gravityRadius: any;
        arrivalThreshold: any;
        baseCritChance: any;
        baseCritDamageMultiplier: any;
        staminaBottomedOutResetPoint: any;
        staminaBottomedOutChargeMultiplier: any;
        staminaRechargeMultiplier: any;
        enduranceXpGainPerSecond: any;
        newCrewMemberCredits: any;
        planetDensity: any;
        cometDensity: any;
        zoneDensity: any;
        aiShipDensity: any;
        cacheDensity: any;
        moraleLowThreshold: any;
        moraleHighThreshold: any;
        maxCrewMembersPerShip: any;
    };
    previousLocationTimeout: number;
    baseCurrencySingular: string;
    baseCurrencyPlural: string;
    shipCosmeticCurrencySingular: string;
    shipCosmeticCurrencyPlural: string;
    crewCosmeticCurrencySingular: string;
    crewCosmeticCurrencyPlural: string;
    supportServerLink: string;
    baseSightRange: number;
    baseBroadcastRange: number;
    baseRepairCost: number;
    defaultHomeworldLevel: number;
    maxBroadcastLength: number;
    guildVendorMultiplier: number;
    guildAllegianceFriendCutoff: number;
    maxCharismaVendorMultiplier: number;
    userIsOfflineTimeout: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    planetContributeCostPerXp: number;
    planetContributeShipCosmeticCostPerXp: number;
    planetContributeCrewCosmeticCostPerXp: number;
    planetLevelXpRequirementMultiplier: number;
    itemUpgradeMultiplier: number;
    itemPriceMultiplier: number;
    itemMassMultiplier: number;
    weaponDamageMultiplier: number;
    displayHPMultiplier: number;
    loungeMoraleGainBasisPerTick: number;
    attackRemnantExpireTime: number;
    cacheExpireTime: number;
    zoneExpireTime: number;
    baseShipScanProperties: {
        id: true;
        name: true;
        human: true;
        ai: true;
        guildId: true;
        speciesId: true;
        until: true;
        headerBackground: true;
        tagline: true;
        level: true;
        dead: true;
        attackable: true;
        previousLocations: true;
        location: true;
        planet: (keyof BasePlanetData)[];
        chassis: (keyof BaseChassisData)[];
    };
    sameGuildShipScanProperties: Partial<ShipScanDataShape>;
    tactics: CombatTactic[];
    baseCargoSellMultiplier: number;
    getHitDamage: (weapon: {
        damage: number;
        repair?: number | undefined;
    }, totalMunitionsSkill?: number) => number;
    getBaseDurabilityLossPerTick: (maxHp: number, reliability: number, useLevel?: number) => number;
    getRadiusDiminishingReturns: (totalValue: number, equipmentCount: number) => number;
    getRepairAmountPerTickForSingleCrewMember: (level: number) => number;
    getMineAmountPerTickForSingleCrewMember: (level: number) => number;
    getResearchAmountPerTickForSingleCrewMember: (level: number) => number;
    getMaxCockpitChargeForSingleCrewMember: (level?: number) => number;
    getCockpitChargePerTickForSingleCrewMember: (level?: number) => number;
    getThrustMagnitudeForSingleCrewMember: (level?: number, engineThrustMultiplier?: number, baseEngineThrustMultiplier?: number) => number;
    getPassiveThrustMagnitudePerTickForSingleCrewMember: (level?: number, engineThrustMultiplier?: number, baseEngineThrustMultiplier?: number) => number;
    getStaminaGainPerTickForSingleCrewMember: (baseStaminaUse: number, rechargeSpeedMultiplier: number) => number;
    getMaxStamina: (enduranceLevel?: number) => number;
    getWeaponCooldownReductionPerTick: (level: number) => number;
    getGeneralMultiplierBasedOnCrewMemberProximity: (cm: CrewMemberStub, crewMembers: CrewMemberStub[]) => number;
    statToString: (data: {
        stat: string;
        amount: number;
    }) => string;
    getPlanetTitle: (planet: PlanetStub) => string;
    getPlanetPopulation: (planet: PlanetStub) => number;
    cargoBuyPriceProximityLimit: number;
    getCargoSellPrice: (cargoId: CargoId, planet: PlanetStub, guildId?: GuildId | undefined, amount?: number, charismaLevel?: number, ignoreProximityLimit?: boolean) => {
        credits: number;
    };
    getCargoBuyPrice: (cargoId: CargoId, planet: PlanetStub, guildId?: GuildId | undefined, amount?: number, charismaLevel?: number) => Price;
    getRepairPrice: (planet: PlanetStub, hp: number, guildId?: GuildId | undefined) => Price;
    getCrewPassivePrice: (passiveForSale: PlanetVendorCrewPassivePrice, currentIntensity: number, planet: PlanetStub, guildId?: GuildId | undefined, charismaLevel?: number) => Price;
    getItemBuyPrice: (itemForSale: PlanetVendorItemPrice, planet: PlanetStub, guildId?: GuildId | undefined, charismaLevel?: number) => Price;
    getItemSellPrice: (itemType: ItemType, itemId: ItemId, planet: PlanetStub, guildId?: GuildId | undefined, itemLevel?: number, charismaLevel?: number) => number;
    itemSellPriceBoostPerLevel: number;
    getChassisSwapPrice: (chassis: PlanetVendorChassisPrice, planet: PlanetStub, currentChassisId: ChassisId, guildId?: GuildId | undefined, charismaLevel?: number) => Price;
    getGuildChangePrice: (ship: {
        planet: false | PlanetStub;
        guildId: GuildId;
        crewMembers: CrewMemberStub[];
    }) => Price;
    canAfford: (price: Price, ship: {
        captain?: string | null | undefined;
        commonCredits?: number | undefined;
        shipCosmeticCurrency?: number | undefined;
    }, crewMember?: {
        id: string;
        credits?: number | undefined;
        crewCosmeticCurrency?: number | undefined;
    } | null | undefined, useShipCommonCredits?: boolean) => number | false;
    getPlanetDefenseRadius: (level: number) => number;
    getPlanetDefenseDamage: (level: number) => number;
    log: (...args: any[]) => void;
    trace: () => void;
    error: (...args: any[]) => void;
    ignoreGrayLogs: () => void;
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
    abbreviateNumber: (number?: number, maxDecimalPlaces?: number) => string;
    speedNumber: (numberInAu: number, noTag?: boolean, maxDecimalPlaces?: number) => string;
    printList: (list: string[], separator?: string) => string;
    degreesToArrow: (angle: number) => string;
    degreesToArrowEmoji: (angle: number) => string;
    coordPairToArrow: (coordPair: CoordinatePair) => string;
    percentToTextBars: (percent?: number, barCount?: number) => string;
    numberToEmoji: (number?: number) => string;
    emojiToNumber: (emoji?: string) => number;
    capitalize: (string?: string, firstOnly?: boolean) => string;
    camelCaseToWords: (string?: string, capitalizeFirst?: boolean | undefined) => string;
    sanitize: (string?: string) => SanitizeResult;
    msToTimeString: (ms?: number, short?: boolean) => string;
    garble: (string?: string, percent?: number) => string;
    acronym: (string?: string) => string;
    priceToString: (p: Price) => string;
    lerp: (v0?: number, v1?: number, t?: number) => number;
    clamp: (lowerBound?: number, n?: number, upperBound?: number) => number;
    r2: (number?: number, decimalPlaces?: number, floor?: boolean | undefined) => number;
    radiansToDegrees: (radians?: number) => number;
    degreesToRadians: (degrees?: number) => number;
    distance: (a?: CoordinatePair, b?: CoordinatePair) => number;
    angleFromAToB: (a?: CoordinatePair, b?: CoordinatePair) => number;
    mirrorAngleVertically: (angle?: number) => number;
    angleDifference: (a?: number, b?: number, signed?: boolean) => number;
    randomInsideCircle: (radius: number) => CoordinatePair;
    degreesToUnitVector: (degrees?: number) => CoordinatePair;
    vectorToUnitVector: (vector?: CoordinatePair) => CoordinatePair;
    unitVectorFromThisPointToThatPoint: (thisPoint?: CoordinatePair, thatPoint?: CoordinatePair) => CoordinatePair;
    pointIsInsideCircle: (center?: CoordinatePair, point?: CoordinatePair, radius?: number) => boolean;
    vectorToDegrees: (coordPair?: CoordinatePair) => number;
    coordPairToRadians: (coordPair?: CoordinatePair) => number;
    vectorToMagnitude: (vector?: CoordinatePair) => number;
    vectorFromDegreesAndMagnitude: (angle?: number, magnitude?: number) => CoordinatePair;
    randomSign: () => 1 | -1;
    randomInRange: (a?: number, b?: number) => number;
    lottery: (odds?: number, outOf?: number) => boolean;
    randomBetween: (start?: number, end?: number) => number;
    gameName: string;
    gameDescription: string;
    gameColor: string;
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