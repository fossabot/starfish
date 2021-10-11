import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import defaultBehavior, { getDefaultAngle } from './default'

export default {
  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    const enemyInRange =
      this.targetShip ||
      c.randomFromArray(
        this.visible.ships.filter(
          (s) =>
            !s.dead &&
            (!s.planet || !s.planet.pacifist) &&
            s.guildId !== `fowl`,
        ),
      )
    if (!enemyInRange)
      return defaultBehavior.determineNewTargetLocation.call(
        this,
      )

    const angleToEnemy = c.angleFromAToB(
      this.location,
      enemyInRange.location,
    )
    const clumsiness = 100 - this.level
    const unitVector = c.degreesToUnitVector(angleToEnemy)

    return [
      this.location[0] +
        unitVector[0] * 0.001 * clumsiness +
        (Math.random() - 0.5) * 0.001 * clumsiness,
      this.location[1] +
        unitVector[1] * 0.001 * clumsiness +
        (Math.random() - 0.5) * 0.001 * clumsiness,
    ]
  },
}
