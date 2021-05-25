import math from './math'
import globals from './globals'

function getUnitVectorFromThatBodyToThisBody(
  thisBody: HasLocation,
  thatBody: HasLocation,
): CoordinatePair {
  if (
    thisBody.location[0] === thatBody.location[0] &&
    thisBody.location[1] === thatBody.location[1]
  ) {
    return [0, 0]
  }
  const angleBetween = math.angleFromAToB(
    thatBody.location,
    thisBody.location,
  )
  return math.degreesToUnitVector(angleBetween)
}

function getGravityForceVectorOnThisBodyDueToThatBody(
  thisBody: HasMassAndLocation,
  thatBody: HasMassAndLocation,
): CoordinatePair {
  if (
    !thisBody ||
    !thatBody ||
    !thisBody.mass ||
    !thatBody.mass
  )
    return [0, 0]

  const m1 = thisBody.mass || 0
  const m2 = thatBody.mass || 0

  const r =
    math.distance(thisBody.location, thatBody.location) *
    globals.KM_PER_AU *
    globals.M_PER_KM
  if (r === 0) return [0, 0]
  const G = globals.GRAVITATIONAL_CONSTANT
  const gravityForce = (-G * m1 * m2) / r ** 2

  const vectorToThisBody: CoordinatePair =
    getUnitVectorFromThatBodyToThisBody(thisBody, thatBody)
  const gravityForceVector: CoordinatePair =
    vectorToThisBody.map(
      (i) => i * gravityForce,
    ) as CoordinatePair

  return gravityForceVector // kg * m / second == N
}

export default {
  getUnitVectorFromThatBodyToThisBody,
  getGravityForceVectorOnThisBodyDueToThatBody,
}
