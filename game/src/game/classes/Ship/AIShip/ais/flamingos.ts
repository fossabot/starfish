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
  { weight: 1, value: `Shrimp Lover` },
  { weight: 1, value: `Wait, Where Am I?` },
  { weight: 1, value: `Pink Patrol` },
]

export default {
  tagline: () => c.randomWithWeights(weightedTaglines),
  headerBackground: `flamingo.webp`,

  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    // * follow target if it has a target
    if (this.targetShip) {
      const angleToEnemy = c.angleFromAToB(
        this.location,
        this.targetShip.location,
      )
      const clumsiness = 100 - this.level
      const unitVector = c.degreesToUnitVector(angleToEnemy)

      return (this.targetLocation = [
        this.location[0] +
          unitVector[0] * 0.0001 * clumsiness +
          (Math.random() - 0.5) * 0.0001 * clumsiness,
        this.location[1] +
          unitVector[1] * 0.0001 * clumsiness +
          (Math.random() - 0.5) * 0.0001 * clumsiness,
      ])
    }

    // * otherwise, move normally
    if (c.lottery(1, 0.05 * c.tickInterval)) {
      const angle = getDefaultAngle.call(this, 70) // * they can move much farther afield than other birds
      const distance = getDefaultDistance.call(this) * 5
      const unitVector = c.degreesToUnitVector(angle)

      return (this.targetLocation = [
        this.location[0] + unitVector[0] * distance,
        this.location[1] + unitVector[1] * distance,
      ])
    }
    return false
  },

  // * flamingos won't fire the first shot at humans
  determineTargetShip(this: AIShip): CombatShip | null {
    const foundLastAttacker =
      this.lastAttackedById &&
      this.visible.ships.find(
        (s) => s.id === this.lastAttackedById,
      )

    if (foundLastAttacker && foundLastAttacker?.dead)
      this.lastAttackedById = null
    else if (foundLastAttacker) {
      return (this.targetShip =
        foundLastAttacker as CombatShip)
    }

    return (this.targetShip = null)
  },
}
