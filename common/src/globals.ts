const levels: number[] = []
let previous = 0
for (let i = 0; i < 100; i++) {
  levels.push(previous + 400 * i * (i / 2))
}

export default {
  GAME_NAME: `SpaceCrab`,
  TICK_INTERVAL: 1000,
  deltaTime: 1000,
  arrivalThreshold: 0.001,
  levels,
}
