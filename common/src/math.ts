function lerp(
  v0: number = 0,
  v1: number = 0,
  t: number = 0,
) {
  return v0 * (1 - t) + v1 * t
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
function degreesToUnitVector(
  degrees: number = 0,
): CoordinatePair {
  let rad = (Math.PI * degrees) / 180
  let r = 1
  return [r * Math.cos(rad), r * Math.sin(rad)]
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
  const angle = Math.random() * 2 * Math.PI
  const radiusSquared = Math.random() * radius * radius
  const x = Math.sqrt(radiusSquared) * Math.cos(angle)
  const y = Math.sqrt(radiusSquared) * Math.sin(angle)
  return [x, y]
}

function randomSign() {
  return Math.random() > 0.5 ? 1 : -1
}
function randomInRange(a: number, b: number) {
  const diff = b - a
  return Math.random() * diff + a
}

export default {
  lerp,
  radiansToDegrees,
  degreesToRadians,
  distance,
  angleFromAToB,
  randomInsideCircle,
  degreesToUnitVector,
  unitVectorFromThisPointToThatPoint,
  pointIsInsideCircle,
  vectorToDegrees,
  coordPairToRadians,
  vectorToMagnitude,
  randomSign,
  randomInRange,
}
