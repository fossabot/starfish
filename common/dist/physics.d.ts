declare function getUnitVectorFromThatBodyToThisBody(
  thisBody: HasLocation,
  thatBody: HasLocation,
): CoordinatePair
declare function getGravityForceVectorOnThisBodyDueToThatBody(
  thisBody: HasMassAndLocation,
  thatBody: HasMassAndLocation,
): CoordinatePair
declare const _default: {
  getUnitVectorFromThatBodyToThisBody: typeof getUnitVectorFromThatBodyToThisBody
  getGravityForceVectorOnThisBodyDueToThatBody: typeof getGravityForceVectorOnThisBodyDueToThatBody
}
export default _default
//# sourceMappingURL=physics.d.ts.map
