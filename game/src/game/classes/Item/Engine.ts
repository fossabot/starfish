import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Engine extends Item {
  readonly id: EngineId
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

  use(usePercent: number = 1): number {
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    let repairLoss =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) *
      usePercent *
      400
    this.repair -= repairLoss
    this._stub = null // invalidate stub
    return repairLoss
  }
}
