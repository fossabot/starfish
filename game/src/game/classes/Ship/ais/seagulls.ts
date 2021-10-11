import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import defaultBehavior, {
  getDefaultAngle,
  getDefaultDistance,
} from './default'

export default {
  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    if (c.lottery(1, 0.05 * c.tickInterval)) {
      const distance = getDefaultDistance.call(this)

      if (Math.random() > 0.2) {
        // most likely that it will look for nearby fowl

        const nearbyFowl = this.visible.ships.filter(
          (s) => s !== this && s.guildId === `fowl`,
        )
        if (nearbyFowl.length) {
          const chosenFowl = c.randomFromArray(nearbyFowl)
          return [
            chosenFowl.location[0] +
              (Math.random() - 0.5) * 0.001 * distance,
            chosenFowl.location[1] +
              (Math.random() - 0.5) * 0.001 * distance,
          ]
        }
      }

      // no fowl target, default to moving normally towards spawn point
      return getDefaultAngle.call(this)
    }
    return false
  },
}
