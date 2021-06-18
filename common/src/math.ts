function lerp(
  v0: number = 0,
  v1: number = 0,
  t: number = 0,
) {
  return v0 * (1 - t) + v1 * t
}

// roundTo:
// @param number (number) Initial number
// @param decimalPlaces (number) Number of decimal places to round to
// @param floor? (boolean) If true, uses floor instead of round.
//
function r2( // "round to"
  number: number,
  decimalPlaces: number = 2,
  floor?: boolean,
): number {
  if (floor)
    return (
      Math.floor(number * 10 ** decimalPlaces) /
      10 ** decimalPlaces
    )
  return (
    Math.round(number * 10 ** decimalPlaces) /
    10 ** decimalPlaces
  )
}

function radiansToDegrees(radians: number = 0) {
  return (180 * radians) / Math.PI
}

function degreesToRadians(degrees: number = 0) {
  return (degrees * Math.PI) / 180
}

function coordPairToRadians(
  coordPair: CoordinatePair = [0, 0],
): number {
  const [x, y] = coordPair
  const angle = Math.atan2(y, x)
  return angle
}
function vectorToDegrees(
  coordPair: CoordinatePair = [0, 0],
): number {
  const angle = coordPairToRadians(coordPair)
  const degrees = (180 * angle) / Math.PI // degrees
  return (360 + degrees) % 360
}

function distance(
  a: CoordinatePair = [0, 0],
  b: CoordinatePair = [0, 0],
) {
  const c = a[0] - b[0]
  const d = a[1] - b[1]
  return Math.sqrt(c * c + d * d)
}
function angleFromAToB(
  a: CoordinatePair = [0, 0],
  b: CoordinatePair = [0, 0],
) {
  return (
    ((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) /
      Math.PI +
      360) %
    360
  )
}
/**
 * shortest distance (in degrees) between two angles.
 * It will be in range [0, 180].
 */
function angleDifference(a: number, b: number): number {
  const c = Math.abs(b - a) % 360
  const d = c > 180 ? 360 - c : c
  return d
}
function degreesToUnitVector(
  degrees: number = 0,
): CoordinatePair {
  let rad = (Math.PI * degrees) / 180
  let r = 1
  return [r * Math.cos(rad), r * Math.sin(rad)]
}
function vectorToUnitVector(
  vector: CoordinatePair = [0, 0],
): CoordinatePair {
  const magnitude = vectorToMagnitude(vector)
  if (magnitude === 0) return [0, 0]
  return [vector[0] / magnitude, vector[1] / magnitude]
}
function unitVectorFromThisPointToThatPoint(
  thisPoint: CoordinatePair = [0, 0],
  thatPoint: CoordinatePair = [0, 0],
): CoordinatePair {
  if (
    thisPoint[0] === thatPoint[0] &&
    thisPoint[1] === thatPoint[1]
  )
    return [0, 0]
  const angleBetween = angleFromAToB(thisPoint, thatPoint)
  return degreesToUnitVector(angleBetween)
}

function vectorToMagnitude(
  vector: CoordinatePair = [0, 0],
): number {
  return Math.sqrt(
    vector[0] * vector[0] + vector[1] * vector[1],
  )
}

function pointIsInsideCircle(
  center: CoordinatePair = [0, 0],
  point: CoordinatePair = [1, 1],
  radius: number = 0,
): boolean {
  return (
    (point[0] - center[0]) * (point[0] - center[0]) +
      (point[1] - center[1]) * (point[1] - center[1]) <=
    radius * radius
  )
}

function randomInsideCircle(
  radius: number,
): CoordinatePair {
  const newCoords = (): CoordinatePair => {
    return [
      Math.random() * radius * 2 - radius,
      Math.random() * radius * 2 - radius,
    ]
  }
  let coords = newCoords()
  while (!pointIsInsideCircle([0, 0], coords, radius))
    coords = newCoords()
  return coords
}

function randomSign() {
  return Math.random() > 0.5 ? 1 : -1
}
function randomInRange(a: number, b: number) {
  const diff = b - a
  return Math.random() * diff + a
}
function lottery(odds: number, outOf: number): boolean {
  return Math.random() < odds / outOf
}

export default {
  lerp,
  r2,
  radiansToDegrees,
  degreesToRadians,
  distance,
  angleFromAToB,
  angleDifference,
  randomInsideCircle,
  degreesToUnitVector,
  vectorToUnitVector,
  unitVectorFromThisPointToThatPoint,
  pointIsInsideCircle,
  vectorToDegrees,
  coordPairToRadians,
  vectorToMagnitude,
  randomSign,
  randomInRange,
  lottery,
}
