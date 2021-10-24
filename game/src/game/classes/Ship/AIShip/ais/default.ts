import c from '../../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import { CombatShip } from '../../CombatShip'

export function getDefaultDistance(this: AIShip): number {
  return ((Math.random() * this.level) / 100) * 10
}

export function getDefaultAngle(
  this: AIShip,
  angleDeviation: number = 40,
): number {
  const angleToHome = c.angleFromAToB(
    this.location,
    this.spawnPoint,
  )
  return Math.random() > 0.85
    ? Math.floor(Math.random() * 360)
    : (angleToHome +
        (Math.random() * angleDeviation * 2 -
          angleDeviation) +
        360) %
        360
}

export default {
  scanTypes: [`humanShip`] as ScanType[],

  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    if (c.lottery(1, 0.05 * c.tickInterval)) {
      const angle = getDefaultAngle.call(this)
      const distance = getDefaultDistance.call(this)
      const unitVector = c.degreesToUnitVector(angle)

      return [
        this.location[0] + unitVector[0] * distance,
        this.location[1] + unitVector[1] * distance,
      ]
    }
    return false
  },

  determineTargetShip(this: AIShip): CombatShip | null {
    // * default: aggressive
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) return null
    return c.randomFromArray(enemies) as CombatShip
  },

  updateSightAndScanRadius(this: AIShip) {
    this.updateAttackRadius()
    this.radii.sight =
      Math.max(...this.radii.attack, 0.1) * 1.3
  },
}
