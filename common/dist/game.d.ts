declare function getBaseDurabilityLossPerTick(maxHp: number): number;
declare function getThrustMagnitudeForSingleCrewMember(skill?: number, engineThrustMultiplier?: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(skill: number): number;
declare function getStaminaGainPerTickForSingleCrewMember(): number;
declare function getWeaponCooldownReductionPerTick(level: number): number;
declare function getCrewPassivePriceMultiplier(level: number): number;
declare function stubify<BaseType, StubType extends BaseStub>(prop: BaseType, disallowPropName?: string[]): StubType;
declare const _default: {
    gameSpeedMultiplier: number;
    baseSightRange: number;
    baseRepairCost: number;
    maxBroadcastLength: number;
    baseStaminaUse: number;
    baseXpGain: number;
    factionVendorMultiplier: number;
    baseItemSellMultiplier: number;
    noEngineThrustMagnitude: number;
    getBaseDurabilityLossPerTick: typeof getBaseDurabilityLossPerTick;
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    getStaminaGainPerTickForSingleCrewMember: typeof getStaminaGainPerTickForSingleCrewMember;
    getWeaponCooldownReductionPerTick: typeof getWeaponCooldownReductionPerTick;
    getCrewPassivePriceMultiplier: typeof getCrewPassivePriceMultiplier;
    tactics: Tactic[];
    cargoTypes: (CargoType | "credits")[];
    stubify: typeof stubify;
};
export default _default;
//# sourceMappingURL=game.d.ts.map