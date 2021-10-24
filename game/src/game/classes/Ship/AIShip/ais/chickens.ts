import c from '../../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import defaultBehavior, { getDefaultAngle } from './default'

export default {
  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    // run away under a certain HP threshold
    if (this._hp < this.maxHp * 0.4) {
      const enemyInRange =
        this.targetShip ||
        c.randomFromArray(
          this.visible.ships.filter(
            (s) => !s.dead && s.guildId !== `fowl`,
          ),
        )
      if (enemyInRange) {
        c.log(`chicken is chickening out`)
        const angleToEnemy = c.angleFromAToB(
          this.location,
          enemyInRange.location,
        )
        const unitVector =
          c.degreesToUnitVector(angleToEnemy)
        return [
          this.location[0] - unitVector[0] * 0.0001,
          this.location[1] - unitVector[1] * 0.0001,
        ]
      }
    }

    // stay still if attacking something
    if (this.targetShip) return false

    // otherwise, randomly move in normal pattern
    return defaultBehavior.determineNewTargetLocation.call(
      this,
    )
  },
}
