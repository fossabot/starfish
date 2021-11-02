import c from '../../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import { CombatShip } from '../../CombatShip'
import defaultBehavior, {
  getDefaultAngle,
  getDefaultDistance,
  commonTaglines,
} from './default'

const weightedTaglines = [
  ...commonTaglines,
  { value: `Carrion Inspector`, weight: 1 },
  { value: `Scrappy`, weight: 1 },
  {
    value: `Cache Rules Everything Around Me`,
    weight: 1,
  },
  { value: `Booty Lover`, weight: 1 },
]

export default {
  tagline: () => c.randomWithWeights(weightedTaglines),
  scanTypes: [`humanShip`, `cache`] as ScanType[],

  updateSightAndScanRadius(this: AIShip) {
    this.updateAttackRadius()
    this.radii.sight =
      Math.max(...this.radii.attack, 0.1) * 2
  },

  determineTargetShip(this: AIShip): CombatShip | null {
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) return (this.targetShip = null)
    return (this.targetShip = enemies[0]) // * closest enemy
  },

  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    const distance = getDefaultDistance.call(this)

    // it will look for nearby caches
    if (this.visible.caches.length) {
      const chosenCache = c.randomFromArray(
        this.visible.caches,
      )
      return (this.targetLocation = [
        chosenCache.location[0] +
          (Math.random() - 0.5) * 0.01 * distance,
        chosenCache.location[1] +
          (Math.random() - 0.5) * 0.01 * distance,
      ])
    }

    // no cache target, default to moving normally towards spawn point
    const angle = getDefaultAngle.call(this)
    const unitVector = c.degreesToUnitVector(angle)

    return (this.targetLocation = [
      this.location[0] + unitVector[0] * distance,
      this.location[1] + unitVector[1] * distance,
    ])
  },
}
