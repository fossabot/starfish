import c from '../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import type { CombatShip } from '../CombatShip'

import defaultBehavior from './default'
import flamingos from './flamingos'
import eagles from './eagles'
import seagulls from './seagulls'
import chickens from './chickens'

const ais: {
  [key: string]: {
    determineNewTargetLocation?: () =>
      | CoordinatePair
      | false
    determineTargetShip?: () => CombatShip | null
  }
} = {
  default: defaultBehavior,
  flamingos,
  seagulls,
  eagles,
  chickens,
}

export default ais
