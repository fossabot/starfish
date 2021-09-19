declare function getHitDamage(weapon: WeaponStub, totalMunitionsSkill?: number): number;
declare function getBaseDurabilityLossPerTick(maxHp: number, reliability: number): number;
declare function getRadiusDiminishingReturns(totalValue: number, equipmentCount: number): number;
declare function getMaxCockpitChargeForSingleCrewMember(level?: number): number;
declare function getCockpitChargePerTickForSingleCrewMember(level?: number): number;
declare function getThrustMagnitudeForSingleCrewMember(level?: number, engineThrustMultiplier?: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(level: number): number;
declare function getMineAmountPerTickForSingleCrewMember(level: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
declare function getCrewPassivePriceMultiplier(level: number): number;
declare function statToString(data: {
    stat: string;
    amount: number;
}): string;
declare function getPlanetTitle(planet: PlanetStub): string;
declare function getPlanetPopulation(planet: PlanetStub): number;
declare function stubify<BaseType, StubType extends BaseStub>(baseObject: BaseType, disallowPropName?: string[], disallowRecursion?: boolean): StubType;
declare const _default: {
    gameShipLimit: number;
    gameSpeedMultiplier: number;
    baseSightRange: number;
    baseBroadcastRange: number;
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
    getHitDamage: typeof getHitDamage;
    getBaseDurabilityLossPerTick: typeof getBaseDurabilityLossPerTick;
    getRadiusDiminishingReturns: typeof getRadiusDiminishingReturns;
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getMineAmountPerTickForSingleCrewMember: typeof getMineAmountPerTickForSingleCrewMember;
    getMaxCockpitChargeForSingleCrewMember: typeof getMaxCockpitChargeForSingleCrewMember;
    getCockpitChargePerTickForSingleCrewMember: typeof getCockpitChargePerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    baseEngineThrustMultiplier: number;
    getStaminaGainPerTickForSingleCrewMember: typeof getStaminaGainPerTickForSingleCrewMember;
    getWeaponCooldownReductionPerTick: typeof getWeaponCooldownReductionPerTick;
    getCrewPassivePriceMultiplier: typeof getCrewPassivePriceMultiplier;
    tactics: Tactic[];
    taglineOptions: string[];
    statToString: typeof statToString;
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
    getPlanetTitle: typeof getPlanetTitle;
    getPlanetPopulation: typeof getPlanetPopulation;
    stubify: typeof stubify;
};
export default _default;
//# sourceMappingURL=game.d.ts.map