export const engines: {
  [key in EngineId]?: BaseEngineData
} = {}

engines.starter = {
  type: `engine`,
  id: `starter`,
  displayName: `Bubble Booster`,
  description: `Exactly what it sounds like.`,
  thrustAmplification: 10,
  maxHp: 10,
}
