declare function getHitDamage(weapon: {
    damage: number;
}, totalMunitionsSkill?: number): number;
declare function getBaseDurabilityLossPerTick(maxHp: number, reliability: number, useLevel?: number): number;
declare function getRadiusDiminishingReturns(totalValue: number, equipmentCount: number): number;
declare function getMaxCockpitChargeForSingleCrewMember(level?: number): number;
declare function getCockpitChargePerTickForSingleCrewMember(level?: number): number;
declare function getThrustMagnitudeForSingleCrewMember(level: number | undefined, engineThrustMultiplier: number | undefined, baseEngineThrustMultiplier: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(level: number): number;
declare function getMineAmountPerTickForSingleCrewMember(level: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(baseStaminaUse: number): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
declare function getGeneralMultiplierBasedOnCrewMemberProximity(cm: CrewMemberStub, crewMembers: CrewMemberStub[]): number;
declare function statToString(data: {
    stat: string;
    amount: number;
}): string;
declare function getPlanetTitle(planet: PlanetStub): string;
declare function getCargoSellPrice(cargoId: CargoId, planet: PlanetStub, amount: number, guildId?: GuildId): number;
declare function getCargoBuyPrice(cargoId: CargoId, planet: PlanetStub, amount: number, guildId?: GuildId): number;
declare function getRepairPrice(planet: PlanetStub, hp: number, guildId?: GuildId): number;
declare function getCrewPassivePrice(passiveForSale: PlanetVendorCrewPassivePrice, currentIntensity: number, planet: PlanetStub, guildId?: GuildId): number;
declare function getItemBuyPrice(itemForSale: PlanetVendorItemPrice, planet: PlanetStub, guildId?: GuildId): number;
declare function getItemSellPrice(itemType: ItemType, itemId: ItemId, planet: PlanetStub, guildId?: GuildId): number;
declare function getChassisSwapPrice(chassis: PlanetVendorChassisPrice, planet: PlanetStub, currentChassisId: ChassisId, guildId?: GuildId): number;
declare function getGuildChangePrice(ship: {
    planet: PlanetStub | false;
    guildId: GuildId;
    crewMembers: CrewMemberStub[];
}): number;
declare function getPlanetPopulation(planet: PlanetStub): number;
declare const _default: {
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
    getGeneralMultiplierBasedOnCrewMemberProximity: typeof getGeneralMultiplierBasedOnCrewMemberProximity;
    statToString: typeof statToString;
    getPlanetTitle: typeof getPlanetTitle;
    getPlanetPopulation: typeof getPlanetPopulation;
    getCargoSellPrice: typeof getCargoSellPrice;
    getCargoBuyPrice: typeof getCargoBuyPrice;
    getRepairPrice: typeof getRepairPrice;
    getCrewPassivePrice: typeof getCrewPassivePrice;
    getItemBuyPrice: typeof getItemBuyPrice;
    getItemSellPrice: typeof getItemSellPrice;
    getChassisSwapPrice: typeof getChassisSwapPrice;
    getGuildChangePrice: typeof getGuildChangePrice;
};
export default _default;
//# sourceMappingURL=game.d.ts.map