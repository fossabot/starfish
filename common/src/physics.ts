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

const scalingFunctions: {
  [key: string]: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
    gravityScalingExponent,
  }) => number
} = {
  defaultRealGravity: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    (-globals.gravitationalConstant * massProduct) /
    rangeInMeters ** 2,

  flexibleExponent: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
    gravityScalingExponent,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (rangeAsPercentOfGravityRadius - 1) **
      (gravityScalingExponent * 2), // *2 so it's always even

  // this one is okay, it just feels like faraway planets are very strong even when you're right next to another planet
  linear: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (1 - rangeAsPercentOfGravityRadius),

  // middle ground between linear and exponential
  quadratic: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (rangeAsPercentOfGravityRadius - 1) ** 2,

  // stronger lean towards exponential
  cubic: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (-1 * (rangeAsPercentOfGravityRadius - 1) ** 3),

  // even stronger lean towards exponential
  sixthPower: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (rangeAsPercentOfGravityRadius - 1) ** 6,

  // even stronger lean towards exponential
  tenthPower: ({
    massProduct,
    rangeInMeters,
    rangeAsPercentOfGravityRadius,
  }) =>
    -1 *
    0.0000015 *
    Math.sqrt(globals.gravitationalConstant * massProduct) *
    (rangeAsPercentOfGravityRadius - 1) ** 10,
}

function getGravityForceVectorOnThisBodyDueToThatBody(
  thisBody: HasMassAndLocationAndVelocity,
  thatBody: HasMassAndLocation,
  gravityScalingExponent: number = 10,
  gravityMultiplier: number = 1,
  gravityRange: number = 0.5,
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
      gravityRange,
      math.distance(thisBody.location, thatBody.location),
    ) *
    globals.kmPerAu *
    globals.mPerKm

  const rangeAsPercentOfGravityRadius =
    rangeInMeters /
    (gravityRange * globals.kmPerAu * globals.mPerKm)

  if (rangeInMeters === 0) return [0, 0]

  // * gives a percentage 0 (thisBody is moving perfectly toawrds/straight away from thatBody), to 1 (thisBody is moving perfectly perpendicular to thatBody)
  const angleToThatBody =
    Math.abs(
      Math.abs(
        math.angleDifference(
          math.vectorToDegrees(thisBody.velocity),
          math.angleFromAToB(
            thatBody.location,
            thisBody.location,
          ),
        ) - 90,
      ) - 90,
    ) / 90

  const maxGravityLesseningEffectPercentage = 0.85
  const coneWidth = 0.15
  let gravityLesseningEffectPercentage = 0
  if (
    angleToThatBody < coneWidth &&
    maxGravityLesseningEffectPercentage > 0
  ) {
    gravityLesseningEffectPercentage = math.lerp(
      0,
      maxGravityLesseningEffectPercentage,
      1 - angleToThatBody / coneWidth,
    )
  }

  // * ----- current scaling function in use -----
  const scalingFunction =
    scalingFunctions.flexibleExponent ||
    scalingFunctions.defaultRealGravity

  // * ----- final gravity force calc -----
  const gravityForce =
    scalingFunction({
      massProduct,
      rangeInMeters,
      rangeAsPercentOfGravityRadius,
      gravityScalingExponent: Math.round(
        gravityScalingExponent,
      ),
    }) *
    gravityMultiplier *
    (1 - gravityLesseningEffectPercentage)

  // c.log({
  //   name: thatBody.name,
  //   gravityScalingExponent,
  //   rangeAsPercentOfGravityRadius,
  //   angleToThatBody,
  //   gravityLesseningEffectPercentage,
  //   gravityForce: gravityForce / 10000,
  // })

  // const differenceFromDefault =
  //   gravityForce -
  //   scalingFunctions.defaultRealGravity() *
  //     gravityScaleFactor

  // c.log({
  //   name: thatBody.name,
  //   gravityForce,
  //   default:
  //     scalingFunctions.defaultRealGravity() *
  //     gravityScaleFactor,
  //   differenceFromDefault,
  //   rangeAsPercentOfGravityRadius,
  // })

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
