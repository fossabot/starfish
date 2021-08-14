const levels: number[] = []
let previous = 0
for (let i = 0; i < 100; i++) {
  levels.push(previous + 400 * i * (i / 2))
}

export default {
  gameName: `Starfish`,
  gameDescription: `Exactly what it sounds like.`,
  tickInterval: 1000,
  mPerKm: 1000,
  kmPerAu: 149597900,
  gravityRange: 1,
  gravitationalConstant: 6.6743 * 10 ** -11,
  lightspeed: 72.1935409205, // aU per hour,
  deltaTime: 1000,
  arrivalThreshold: 0.001,
  levels,
}
