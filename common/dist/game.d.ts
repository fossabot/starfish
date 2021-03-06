declare function getHitDamage(weapon: {
    damage: number;
    repair?: number;
}, totalMunitionsSkill?: number): number;
declare function getBaseDurabilityLossPerTick(maxHp: number, reliability: number, useLevel?: number): number;
declare function getRadiusDiminishingReturns(totalValue: number, equipmentCount: number): number;
declare function getMaxCockpitChargeForSingleCrewMember(level?: number): number;
declare function getCockpitChargePerTickForSingleCrewMember(level?: number): number;
declare function getThrustMagnitudeForSingleCrewMember(level?: number, engineThrustMultiplier?: number, baseEngineThrustMultiplier?: number): number;
declare function getPassiveThrustMagnitudePerTickForSingleCrewMember(level?: number, engineThrustMultiplier?: number, baseEngineThrustMultiplier?: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(level: number): number;
declare function getMineAmountPerTickForSingleCrewMember(level: number): number;
declare function getResearchAmountPerTickForSingleCrewMember(level: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(baseStaminaUse: number, rechargeSpeedMultiplier: number): number;
declare function getMaxStamina(enduranceLevel?: number): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
/**
 * Returns a multiplier (1 being the baseline) that incorporates general improvement when alone AND when with friends
 */
declare function getGeneralMultiplierBasedOnCrewMemberProximity(cm: CrewMemberStub, crewMembers: CrewMemberStub[]): number;
declare function getPlanetDefenseRadius(level: number): number;
declare function getPlanetDefenseDamage(level: number): number;
declare function statToString(data: {
    stat: string;
    amount: number;
}): string;
declare function getPlanetTitle(planet: PlanetStub): string;
declare function getCargoSellPrice(cargoId: CargoId, planet: PlanetStub, guildId?: GuildId, amount?: number, charismaLevel?: number, ignoreProximityLimit?: boolean): {
    credits: number;
};
declare function getCargoBuyPrice(cargoId: CargoId, planet: PlanetStub, guildId?: GuildId, amount?: number, charismaLevel?: number): Price;
declare function getRepairPrice(planet: PlanetStub, hp: number, guildId?: GuildId): Price;
declare function getCrewPassivePrice(passiveForSale: PlanetVendorCrewPassivePrice, currentIntensity: number, planet: PlanetStub, guildId?: GuildId, charismaLevel?: number): Price;
declare function getItemBuyPrice(itemForSale: PlanetVendorItemPrice, planet: PlanetStub, guildId?: GuildId, charismaLevel?: number): Price;
declare function getItemSellPrice(itemType: ItemType, itemId: ItemId, planet: PlanetStub, guildId?: GuildId, itemLevel?: number, charismaLevel?: number): number;
declare function getChassisSwapPrice(chassis: PlanetVendorChassisPrice, planet: PlanetStub, currentChassisId: ChassisId, guildId?: GuildId, charismaLevel?: number): Price;
declare function getGuildChangePrice(ship: {
    planet: PlanetStub | false;
    guildId: GuildId;
    crewMembers: CrewMemberStub[];
}): Price;
declare function getPlanetPopulation(planet: PlanetStub): number;
declare function canAfford(price: Price, ship: {
    captain?: string | null;
    commonCredits?: number;
    shipCosmeticCurrency?: number;
}, crewMember?: {
    id: string;
    credits?: number;
    crewCosmeticCurrency?: number;
} | null, useShipCommonCredits?: boolean): false | number;
declare const _default: {
    getHitDamage: typeof getHitDamage;
    getBaseDurabilityLossPerTick: typeof getBaseDurabilityLossPerTick;
    getRadiusDiminishingReturns: typeof getRadiusDiminishingReturns;
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getMineAmountPerTickForSingleCrewMember: typeof getMineAmountPerTickForSingleCrewMember;
    getResearchAmountPerTickForSingleCrewMember: typeof getResearchAmountPerTickForSingleCrewMember;
    getMaxCockpitChargeForSingleCrewMember: typeof getMaxCockpitChargeForSingleCrewMember;
    getCockpitChargePerTickForSingleCrewMember: typeof getCockpitChargePerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    getPassiveThrustMagnitudePerTickForSingleCrewMember: typeof getPassiveThrustMagnitudePerTickForSingleCrewMember;
    getStaminaGainPerTickForSingleCrewMember: typeof getStaminaGainPerTickForSingleCrewMember;
    getMaxStamina: typeof getMaxStamina;
    getWeaponCooldownReductionPerTick: typeof getWeaponCooldownReductionPerTick;
    getGeneralMultiplierBasedOnCrewMemberProximity: typeof getGeneralMultiplierBasedOnCrewMemberProximity;
    statToString: typeof statToString;
    getPlanetTitle: typeof getPlanetTitle;
    getPlanetPopulation: typeof getPlanetPopulation;
    cargoBuyPriceProximityLimit: number;
    getCargoSellPrice: typeof getCargoSellPrice;
    getCargoBuyPrice: typeof getCargoBuyPrice;
    getRepairPrice: typeof getRepairPrice;
    getCrewPassivePrice: typeof getCrewPassivePrice;
    getItemBuyPrice: typeof getItemBuyPrice;
    getItemSellPrice: typeof getItemSellPrice;
    itemSellPriceBoostPerLevel: number;
    getChassisSwapPrice: typeof getChassisSwapPrice;
    getGuildChangePrice: typeof getGuildChangePrice;
    canAfford: typeof canAfford;
    getPlanetDefenseRadius: typeof getPlanetDefenseRadius;
    getPlanetDefenseDamage: typeof getPlanetDefenseDamage;
};
export default _default;
//# sourceMappingURL=game.d.ts.map