import math from './math'
import globals from './globals'
import c from './log'

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
  const massProduct = m1 * m2

  const rangeInMeters =
    Math.min(
      globals.gravityRange,
      math.distance(thisBody.location, thatBody.location),
    ) *
    globals.kmPerAu *
    globals.mPerKm

  const rangeAsPercentOfGravityRadius =
    rangeInMeters /
    (globals.gravityRange *
      globals.kmPerAu *
      globals.mPerKm)

  if (rangeInMeters === 0) return [0, 0]

  const scalingFunctions: {
    [key: string]: () => number
  } = {
    defaultRealGravity: () =>
      (-globals.gravitationalConstant * massProduct) /
      rangeInMeters ** 2,

    // this one is okay, it just feels like faraway planets are very strong even when you're right next to another planet
    linear: () =>
      -1 *
      0.000003 *
      Math.sqrt(
        globals.gravitationalConstant * massProduct,
      ) *
      (1 - rangeAsPercentOfGravityRadius),

    // middle ground between linear and exponential
    quadratic: () =>
      -1 *
      0.000003 *
      Math.sqrt(
        globals.gravitationalConstant * massProduct,
      ) *
      (rangeAsPercentOfGravityRadius - 1) ** 2,

    // stronger lean towards default exponential
    cubic: () =>
      -1 *
      0.000003 *
      Math.sqrt(
        globals.gravitationalConstant * massProduct,
      ) *
      (-1 * (rangeAsPercentOfGravityRadius - 1) ** 3),
  }

  // * ----- current scaling function in use -----
  const scalingFunction = scalingFunctions.cubic

  // * ----- flat gravity scaling -----
  const gravityScaleFactor = 0.2

  const gravityForce =
    scalingFunction() * gravityScaleFactor

  const differenceFromDefault =
    gravityForce -
    scalingFunctions.defaultRealGravity() *
      gravityScaleFactor

  c.log({
    name: thatBody.name,
    gravityForce,
    default:
      scalingFunctions.defaultRealGravity() *
      gravityScaleFactor,
    differenceFromDefault,
    rangeAsPercentOfGravityRadius,
  })

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
