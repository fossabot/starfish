declare function getUnitVectorFromThatBodyToThisBody(thisBody: HasLocation, thatBody: HasLocation): CoordinatePair;
declare function getGravityForceVectorOnThisBodyDueToThatBody(thisBody: HasMassAndLocationAndVelocity, thatBody: HasMassAndLocation, gravityScalingExponent?: number, gravityMultiplier?: number, gravityRange?: number): CoordinatePair;
declare const _default: {
    getUnitVectorFromThatBodyToThisBody: typeof getUnitVectorFromThatBodyToThisBody;
    getGravityForceVectorOnThisBodyDueToThatBody: typeof getGravityForceVectorOnThisBodyDueToThatBody;
};
export default _default;
//# sourceMappingURL=physics.d.ts.map