declare function getHitDamage(weapon: WeaponStub, totalMunitionsSkill?: number): number;
declare function getBaseDurabilityLossPerTick(maxHp: number, reliability: number, useLevel?: number): number;
declare function getRadiusDiminishingReturns(totalValue: number, equipmentCount: number): number;
declare function getMaxCockpitChargeForSingleCrewMember(level?: number): number;
declare function getCockpitChargePerTickForSingleCrewMember(level?: number): number;
declare function getThrustMagnitudeForSingleCrewMember(level: number | undefined, engineThrustMultiplier: number | undefined, baseEngineThrustMultiplier: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(level: number): number;
declare function getMineAmountPerTickForSingleCrewMember(level: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(baseStaminaUse: number): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
declare function getCrewPassivePriceMultiplier(level: number): number;
declare function statToString(data: {
    stat: string;
    amount: number;
}): string;
declare function getPlanetTitle(planet: PlanetStub): string;
declare function getCargoSellPrice(cargoId: CargoId, planet: PlanetStub, amount: number, factionId: FactionId): number;
declare function getCargoBuyPrice(cargoId: CargoId, planet: PlanetStub, amount: number, factionId: FactionId): number;
declare function getPlanetPopulation(planet: PlanetStub): number;
declare const _default: {
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
    getHitDamage: typeof getHitDamage;
    getBaseDurabilityLossPerTick: typeof getBaseDurabilityLossPerTick;
    getRadiusDiminishingReturns: typeof getRadiusDiminishingReturns;
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getMineAmountPerTickForSingleCrewMember: typeof getMineAmountPerTickForSingleCrewMember;
    getMaxCockpitChargeForSingleCrewMember: typeof getMaxCockpitChargeForSingleCrewMember;
    getCockpitChargePerTickForSingleCrewMember: typeof getCockpitChargePerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    getStaminaGainPerTickForSingleCrewMember: typeof getStaminaGainPerTickForSingleCrewMember;
    getWeaponCooldownReductionPerTick: typeof getWeaponCooldownReductionPerTick;
    getCrewPassivePriceMultiplier: typeof getCrewPassivePriceMultiplier;
    tactics: CombatTactic[];
    baseCargoSellMultiplier: number;
    taglineOptions: string[];
    statToString: typeof statToString;
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
    getPlanetTitle: typeof getPlanetTitle;
    getPlanetPopulation: typeof getPlanetPopulation;
    getCargoSellPrice: typeof getCargoSellPrice;
    getCargoBuyPrice: typeof getCargoBuyPrice;
};
export default _default;
//# sourceMappingURL=game.d.ts.map