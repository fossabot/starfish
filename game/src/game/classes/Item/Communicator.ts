import c from '../../../../../common/dist'
import type { CrewMember } from '../CrewMember/CrewMember'
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

  use(usePercent: number = 1, user?: CrewMember) {
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    const skillLevel =
      user?.skills.find((s) => s.skill === `piloting`)
        ?.level || 1

    let repairLoss = Math.min(
      1 / this.maxHp / 2,
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
        skillLevel,
      ) * 70,
    )
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    repairLoss += super.use()
    return repairLoss
  }
}
