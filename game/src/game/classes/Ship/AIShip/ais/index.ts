import c from '../../../../../../../common/dist'
import type { AIShip } from '../AIShip'
import type { CombatShip } from '../../CombatShip'

import defaultBehavior from './default'
import flamingos from './flamingos'
import eagles from './eagles'
import seagulls from './seagulls'
import chickens from './chickens'
import vultures from './vultures'

const ais: {
  [key: string]: {
    scanTypes?: ScanType[]
    determineNewTargetLocation?: () =>
      | CoordinatePair
      | false
    determineTargetShip?: () => CombatShip | null
    updateSightAndScanRadius?: () => void
  }
} = {
  default: defaultBehavior,
  flamingos,
  seagulls,
  eagles,
  chickens,
  vultures,
}

export default ais
