declare const _default: {
    supportServerLink: string;
    gameSpeedMultiplier: number;
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
        planet: ("planetType" | "id" | "name" | "color" | "location" | "radius" | "mass" | "landingRadiusMultiplier" | "level" | "xp" | "baseLevel" | "creatures" | "passives" | "pacifist" | "stats")[];
        chassis: ("id" | "mass" | "passives" | "type" | "basePrice" | "displayName" | "description" | "slots" | "agility" | "maxCargoSpace" | "rarity")[];
    };
    sameGuildShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    tactics: CombatTactic[];
    baseCargoSellMultiplier: number;
    taglineOptions: string[];
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
};
export default _default;
//# sourceMappingURL=gameConstants.d.ts.map