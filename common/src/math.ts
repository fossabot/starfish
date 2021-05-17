function lerp(v0: number, v1: number, t: number) {
  return v0 * (1 - t) + v1 * t
}

function radiansToDegrees(radians: number) {
  return (180 * radians) / Math.PI
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function coordPairToRadians(
  coordPair: CoordinatePair,
): number {
  const [x, y] = coordPair
  const angle = Math.atan2(y, x)
  return angle
}
function vectorToDegrees(
  coordPair: CoordinatePair,
): number {
  const angle = coordPairToRadians(coordPair)
  const degrees = (180 * angle) / Math.PI // degrees
  return (360 + degrees) % 360
}

function distance(a: CoordinatePair, b: CoordinatePair) {
  const c = a[0] - b[0]
  const d = a[1] - b[1]
  return Math.sqrt(c * c + d * d)
}
function angleFromAToB(
  a: CoordinatePair,
  b: CoordinatePair,
) {
  return (
    ((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) /
      Math.PI +
      360) %
    360
  )
}
function degreesToUnitVector(
  degrees: number,
): CoordinatePair {
  let rad = (Math.PI * degrees) / 180
  let r = 1
  return [r * Math.cos(rad), r * Math.sin(rad)]
}
function unitVectorFromThisPointToThatPoint(
  thisPoint: CoordinatePair,
  thatPoint: CoordinatePair,
): CoordinatePair {
  if (
    thisPoint[0] === thatPoint[0] &&
    thisPoint[1] === thatPoint[1]
  )
    return [0, 0]
  const angleBetween = angleFromAToB(thisPoint, thatPoint)
  return degreesToUnitVector(angleBetween)
}

function vectorToMagnitude(vector: CoordinatePair): number {
  return Math.sqrt(
    vector[0] * vector[0] + vector[1] * vector[1],
  )
}

function pointIsInsideCircle(
  center: CoordinatePair,
  point: CoordinatePair,
  radius: number,
): boolean {
  return (
    (point[0] - center[0]) * (point[0] - center[0]) +
      (point[1] - center[1]) * (point[1] - center[1]) <=
    radius * radius
  )
}

export default {
  lerp,
  radiansToDegrees,
  degreesToRadians,
  distance,
  angleFromAToB,
  degreesToUnitVector,
  unitVectorFromThisPointToThatPoint,
  pointIsInsideCircle,
  vectorToDegrees,
  coordPairToRadians,
  vectorToMagnitude,
}
