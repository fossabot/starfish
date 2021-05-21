declare function getThrustMagnitudeForSingleCrewMember(skill?: number, engineThrustMultiplier?: number): number;
declare function getRepairAmountPerTickForSingleCrewMember(skill: number): number;
declare function stubify<BaseType, StubType extends BaseStub>(prop: BaseType, disallowPropName?: string[]): StubType;
declare const _default: {
    getRepairAmountPerTickForSingleCrewMember: typeof getRepairAmountPerTickForSingleCrewMember;
    getThrustMagnitudeForSingleCrewMember: typeof getThrustMagnitudeForSingleCrewMember;
    tactics: Tactic[];
    cargoTypes: ("credits" | CargoType)[];
    stubify: typeof stubify;
};
export default _default;
//# sourceMappingURL=game.d.ts.map