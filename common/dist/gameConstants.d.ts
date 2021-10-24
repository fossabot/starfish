declare const _default: {
    baseCurrencySingular: string;
    baseCurrencyPlural: string;
    shipSpecialCurrencySingular: string;
    shipSpecialCurrencyPlural: string;
    crewSpecialCurrencySingular: string;
    crewSpecialCurrencyPlural: string;
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