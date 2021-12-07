import c from '../../../../../../../../common/dist'
import type { AIShip } from '../../AIShip'
import { CombatShip } from '../../../CombatShip'
import defaultBehavior, {
  getDefaultAngle,
  commonTaglines,
} from './default'

const weightedTaglines = [
  ...commonTaglines,
  { weight: 1, value: `Balding` },
  { weight: 1, value: `Sharpened Talons` },
  { weight: 1, value: `SCREEEEEEEEEEEEEECH` },
  { weight: 0.5, value: `Hungry for Octopi` },
  { weight: 0.5, value: `Hungry for Turtles` },
  { value: `Orbital Striker`, weight: 1 },
]

export default {
  tagline: () => c.randomWithWeights(weightedTaglines),

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

    return (this.targetLocation = [
      this.location[0] +
        unitVector[0] * 0.0001 * clumsiness +
        (Math.random() - 0.5) * 0.0001 * clumsiness,
      this.location[1] +
        unitVector[1] * 0.0001 * clumsiness +
        (Math.random() - 0.5) * 0.0001 * clumsiness,
    ])
  },
}
