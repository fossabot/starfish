import c from '../../../../../common/dist'
import type { CrewMember } from '../CrewMember/CrewMember'
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

  use(
    usePercent: number = 1,
    users?: CrewMember[],
  ): number {
    if (this.ship.tutorial?.currentStep.disableRepair)
      return 0

    const skillLevel = users
      ? users.reduce(
          (total, u) =>
            (u.skills.find((s) => s.skill === `piloting`)
              ?.level || 1) + total,
          0,
        ) / users.length
      : 1

    const flatLoss = 0.001 * c.gameSpeedMultiplier
    let repairLoss = Math.min(
      1 / this.maxHp / 2,
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
        skillLevel,
      ) *
        usePercent *
        400 +
        flatLoss,
    )
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    this.lastUse = Date.now()
    this._stub = null // invalidate stub
    return repairLoss
  }
}
