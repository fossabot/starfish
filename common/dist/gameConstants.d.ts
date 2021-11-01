declare const _default: {
    defaultGameSettings: {
        id: any;
        humanShipLimit: any;
        safeZoneRadius: any;
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
        newCrewMemberCredits: any;
        planetDensity: any;
        cometDensity: any;
        zoneDensity: any;
        aiShipDensity: any;
        cacheDensity: any;
    };
    baseCurrencySingular: string;
    baseCurrencyPlural: string;
    shipCosmeticCurrencySingular: string;
    shipCosmeticCurrencyPlural: string;
    crewCosmeticCurrencySingular: string;
    crewCosmeticCurrencyPlural: string;
    baseTaglinePrice: number;
    baseHeaderBackgroundPrice: number;
    buyableHeaderBackgrounds: {
        rarity: number;
        value: HeaderBackground;
    }[];
    buyableTaglines: {
        rarity: number;
        value: string;
    }[];
    supportServerLink: string;
    baseSightRange: number;
    baseBroadcastRange: number;
    baseRepairCost: number;
    defaultHomeworldLevel: number;
    maxBroadcastLength: number;
    guildVendorMultiplier: number;
    guildAllegianceFriendCutoff: number;
    userIsOfflineTimeout: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    planetContributeCostPerXp: number;
    planetContributeShipCosmeticCostPerXp: number;
    planetContributeCrewCosmeticCostPerXp: number;
    planetLevelXpRequirementMultiplier: number;
    itemPriceMultiplier: number;
    itemMassMultiplier: number;
    weaponDamageMultiplier: number;
    attackRemnantExpireTime: number;
    cacheExpireTime: number;
    baseShipScanProperties: {
        id: true;
        name: true;
        human: true;
        ai: true;
        guildId: true;
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
    sameGuildShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    tactics: CombatTactic[];
    baseCargoSellMultiplier: number;
};
export default _default;
//# sourceMappingURL=gameConstants.d.ts.map