import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import type { CombatShip } from '../CombatShip'

export function getDefaultDistance(this: AIShip): number {
  return ((Math.random() * this.level) / 100) * 2
}

export function getDefaultAngle(
  this: AIShip,
): CoordinatePair {
  const distance = getDefaultDistance.call(this)
  const angleToHome = c.angleFromAToB(
    this.location,
    this.spawnPoint,
  )
  const angleDeviation = 40
  const chosenAngle =
    Math.random() > 0.8
      ? Math.floor(Math.random() * 360)
      : (angleToHome +
          (Math.random() * angleDeviation * 2 -
            angleDeviation) +
          360) %
        360
  const unitVector = c.degreesToUnitVector(chosenAngle)

  return [
    this.location[0] + unitVector[0] * distance,
    this.location[1] + unitVector[1] * distance,
  ]
}

export default {
  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    if (c.lottery(1, 0.05 * c.tickInterval))
      return getDefaultAngle.call(this)
    return false
  },

  determineTargetShip(this: AIShip): CombatShip | null {
    // * default: aggressive
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) return null
    return c.randomFromArray(enemies) as CombatShip
  },
}
