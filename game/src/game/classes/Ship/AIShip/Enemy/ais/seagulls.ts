import c from '../../../../../../../../common/dist'
import type { AIShip } from '../../AIShip'
import { CombatShip } from '../../../CombatShip'
import defaultBehavior, {
  getDefaultAngle,
  getDefaultDistance,
  commonTaglines,
} from './default'

const weightedTaglines = [
  ...commonTaglines,
  { weight: 0.5, value: `I'm a Seagull!` },
  { weight: 1, value: `Mine` },
  { weight: 0.7, value: `Swan Diver` },
  { weight: 0.5, value: `Hungry for Crabs` },
  { weight: 0.5, value: `Hungry for Snails` },
]

export default {
  tagline: () => c.randomWithWeights(weightedTaglines),
  scanTypes: [`humanShip`, `aiShip`] as ScanType[],

  determineNewTargetLocation(
    this: AIShip,
  ): CoordinatePair | false {
    const distance = getDefaultDistance.call(this)

    if (Math.random() > 0.1) {
      // most likely that it will look for nearby fowl
      const nearbyFowl = this.visible.ships.filter(
        (s) => s !== this && s.guildId === `fowl`,
      )
      if (nearbyFowl.length) {
        const chosenFowl = c.randomFromArray(nearbyFowl)
        return (this.targetLocation = [
          chosenFowl.location[0] +
            (Math.random() - 0.5) * 0.001 * distance,
          chosenFowl.location[1] +
            (Math.random() - 0.5) * 0.001 * distance,
        ])
      }
    }

    // no fowl target, default to moving normally towards spawn point
    const angle = getDefaultAngle.call(this)
    const unitVector = c.degreesToUnitVector(angle)

    return (this.targetLocation = [
      this.location[0] + unitVector[0] * distance,
      this.location[1] + unitVector[1] * distance,
    ])
  },
}
