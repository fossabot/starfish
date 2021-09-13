import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Communicator extends Item {
  readonly id: CommunicatorId
  readonly range: number
  readonly antiGarble: number
  lastUse: number = 0

  constructor(
    data: BaseCommunicatorData,
    ship: Ship,
    props?: Partial<BaseCommunicatorData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.range = data.range
    this.antiGarble = data.antiGarble
  }

  use() {
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    let repairLoss = Math.min(
      1 / this.maxHp / 2,
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) * 100,
    )
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    repairLoss += super.use()
    return repairLoss
  }
}
