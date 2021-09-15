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
    Math.min(
      globals.gravityRange,
      math.distance(thisBody.location, thatBody.location),
    ) *
    globals.kmPerAu *
    globals.mPerKm

  if (r === 0) return [0, 0]

  // const scalingFunction = (
  //   rangeInMeters,
  //   massProduct: number,
  // ) =>
  //   0.0001 *
  //   Math.sqrt(globals.gravitationalConstant * massProduct) *
  //   (rangeInMeters /
  //     (globals.gravityRange *
  //       globals.kmPerAu *
  //       globals.mPerKm))
  // const gravityForce = scalingFunction(r, m1 * m2)

  // real formula is (-globals.gravitationalConstant * m1 * m2) / r ** 2
  // // * to make gravity feel more 'forceful', we're letting it have an effect over a larger zone
  const gravityForce =
  (-globals.gravitationalConstant * m1 * m2) / Math.abs(r)

  const vectorToThisBody: CoordinatePair =
    getUnitVectorFromThatBodyToThisBody(thisBody, thatBody)
  const gravityForceVector: CoordinatePair =
    vectorToThisBody.map(
      (i) => i * gravityForce,
    ) as CoordinatePair

  console.log(gravityForce, gravityForceVector)
  // if (gravityForce < -1012223) console.log(gravityForce)
  return gravityForceVector // kg * m / second == N
}

export default {
  getUnitVectorFromThatBodyToThisBody,
  getGravityForceVectorOnThisBodyDueToThatBody,
}
