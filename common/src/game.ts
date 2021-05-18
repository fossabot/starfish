import math from './math'

function getThrustMagnitudeForSingleCrewMember(
  skill: number = 1,
  engineThrustMultiplier: number = 1,
): number {
  return (
    math.lerp(0.0001, 0.001, skill / 100) *
    engineThrustMultiplier
  )
}

const tactics: Tactic[] = [`aggressive`, `defensive`]

export default {
  getThrustMagnitudeForSingleCrewMember,
  tactics,
}
