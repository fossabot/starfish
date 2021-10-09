import c from '../../../../common/dist'

export default function (): AdminGameSettings {
  const defaultGameSettings: {
    [key in keyof AdminGameSettings]: any
  } = {
    id: `game` + `${Math.random()}`.substring(2),
    humanShipLimit: 100,
    aiDifficultyMultiplier: 0.5,
    brakeToThrustRatio: 5,
    baseXpGain: 0.5,
    baseStaminaUse: 0.0001,
    baseEngineThrustMultiplier: 1,
    gravityMultiplier: 2.5,
    gravityCurveSteepness: 5, // integers
    gravityRadius: 0.5,
    arrivalThreshold: 0.001,
    baseCritChance: 0.01,
    baseCritDamageMultiplier: 2,

    planetDensity: 0.9,
    zoneDensity: 1.15,
    aiShipDensity: 3,
    cacheDensity: 1.5,
  }
  return defaultGameSettings
}
