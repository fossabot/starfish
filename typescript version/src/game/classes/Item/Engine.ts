import c from '../../../common'
import { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Engine extends Item {
  readonly thrustAmplification: number

  constructor(data: BaseEngineData, ship: Ship) {
    super(data, ship)
    this.thrustAmplification = data.thrustAmplification
  }
}
