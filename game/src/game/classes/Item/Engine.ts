import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Engine extends Item {
  readonly id: EngineType
  readonly thrustAmplification: number

  constructor(
    data: BaseEngineData,
    ship: Ship,
    props?: Partial<BaseEngineData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.thrustAmplification = data.thrustAmplification
  }
}
