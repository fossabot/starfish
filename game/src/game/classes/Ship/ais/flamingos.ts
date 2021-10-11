import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import { CombatShip } from '../CombatShip'
import defaultBehavior, { getDefaultAngle } from './default'

export default {
  // determineNewTargetLocation(
  //   this: AIShip,
  // ): CoordinatePair | false {
  //   return defaultBehavior.determineNewTargetLocation.call(
  //     this,
  //   )
  // },

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
