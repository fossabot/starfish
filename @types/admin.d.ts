interface AdminGameSettings {
  id: string
  humanShipLimit: number
  aiDifficultyMultiplier: number
  baseXpGain: number
  baseStaminaUse: number
  brakeToThrustRatio: number
  baseEngineThrustMultiplier: number
  gravityMultiplier: number
  gravityScalingFunction: string
  gravityRadius: number
  arrivalThreshold: number
}
