import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Engine extends Item {
  readonly id: EngineId
  readonly thrustAmplification: number
  lastUse: number = Date.now()

  constructor(
    data: BaseEngineData,
    ship: Ship,
    props?: Partial<BaseEngineData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.thrustAmplification = data.thrustAmplification
    this.lastUse = data.lastUse || 0
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
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    this._stub = null // invalidate stub
    return repairLoss
  }
}
