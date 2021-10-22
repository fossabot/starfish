import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import type { CombatShip } from '../CombatShip'
import defaultBehavior, {
  getDefaultAngle,
  getDefaultDistance,
} from './default'

export default {
  scanTypes: [`humanShip`, `cache`] as ScanType[],

  updateSightAndScanRadius(this: AIShip) {
    this.updateAttackRadius()
    this.radii.sight =
      Math.max(...this.radii.attack, 0.1) * 2
  },

  determineTargetShip(this: AIShip): CombatShip | null {
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) return null
    return enemies[0] // * closest enemy
  },

  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    const distance = getDefaultDistance.call(this)

    if (Math.random() > 0.1) {
      // most likely that it will look for nearby caches

      if (this.visible.caches.length) {
        const chosenCache = c.randomFromArray(
          this.visible.caches,
        )
        return [
          chosenCache.location[0] +
            (Math.random() - 0.5) * 0.001 * distance,
          chosenCache.location[1] +
            (Math.random() - 0.5) * 0.001 * distance,
        ]
      }
    }

    // no cache target, default to moving normally towards spawn point
    const angle = getDefaultAngle.call(this)
    const unitVector = c.degreesToUnitVector(angle)

    return [
      this.location[0] + unitVector[0] * distance,
      this.location[1] + unitVector[1] * distance,
    ]
  },
}
