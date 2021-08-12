declare function getHitDamage(weapon: WeaponStub, totalMunitionsSkill?: number): number;
declare function getBaseDurabilityLossPerTick(maxHp: number, reliability: number): number;
declare function getRadiusDiminishingReturns(totalValue: number, equipmentCount: number): number;
declare function getMaxCockpitChargeForSingleCrewMember(level?: number): number;
declare function getCockpitChargePerTickForSingleCrewMember(level?: number): number;
declare function getThrustMagnitudeForSingleCrewMember(level?: number, engineThrustMultiplier?: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(level: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
declare function getCrewPassivePriceMultiplier(level: number): number;
declare function stubify<BaseType, StubType extends BaseStub>(prop: BaseType, disallowPropName?: string[]): StubType;
declare const _default: {
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
        planet: ("name" | "color" | "location" | "radius" | "factionId" | "homeworld" | "creatures" | "repairCostMultiplier" | "allegiances" | "vendor")[];
        faction: ("name" | "color" | "homeworld" | "id" | "ai" | "species")[];
        species: ("factionId" | "id" | "icon" | "singular" | "description" | "passives")[];
        chassis: ("id" | "description" | "type" | "mass" | "basePrice" | "displayName" | "slots" | "agility" | "maxCargoSpace" | "rarity")[];
    };
    sameFactionShipScanProperties: {
        _hp: boolean;
        _maxHp: boolean;
    };
    getHitDamage: typeof getHitDamage;
    getBaseDurabilityLossPerTick: typeof getBaseDurabilityLossPerTick;
    getRadiusDiminishingReturns: typeof getRadiusDiminishingReturns;
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getMaxCockpitChargeForSingleCrewMember: typeof getMaxCockpitChargeForSingleCrewMember;
    getCockpitChargePerTickForSingleCrewMember: typeof getCockpitChargePerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    getStaminaGainPerTickForSingleCrewMember: typeof getStaminaGainPerTickForSingleCrewMember;
    getWeaponCooldownReductionPerTick: typeof getWeaponCooldownReductionPerTick;
    getCrewPassivePriceMultiplier: typeof getCrewPassivePriceMultiplier;
    tactics: Tactic[];
    cargoTypes: ("salt" | "water" | "oxygen" | "plastic" | "carbon" | "steel" | "titanium" | "uranium" | "credits")[];
    taglineOptions: string[];
    headerBackgroundOptions: {
        id: string;
        url: string;
    }[];
    stubify: typeof stubify;
};
export default _default;
//# sourceMappingURL=game.d.ts.map