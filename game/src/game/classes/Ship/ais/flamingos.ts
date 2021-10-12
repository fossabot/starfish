import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import { CombatShip } from '../CombatShip'
import defaultBehavior, {
  getDefaultAngle,
  getDefaultDistance,
} from './default'

export default {
  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    if (c.lottery(1, 0.05 * c.tickInterval)) {
      const angle = getDefaultAngle.call(this)
      const distance = getDefaultDistance.call(this) * 10 // they move much farther than other birds
      const unitVector = c.degreesToUnitVector(angle)

      return [
        this.location[0] + unitVector[0] * distance,
        this.location[1] + unitVector[1] * distance,
      ]
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
    if (foundLastAttacker) {
      c.log(`flam`, foundLastAttacker.name)
      return foundLastAttacker as CombatShip
    }

    return null
  },
}
