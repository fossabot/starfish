import c from '../../../../../../common/dist'
import type { Ship } from '../Ship'

import { Item } from './Item'

export class Scanner extends Item {
  sightRange: number
  shipScanRange: number
  readonly shipScanData: ShipScanDataShape

  constructor(
    data: BaseScannerData,
    ship: Ship,
    props?: Partial<BaseScannerData>,
  ) {
    super(data, ship, props)
    this.sightRange = data.sightRange
    this.shipScanRange = data.shipScanRange
    this.shipScanData = data.shipScanData
  }

  use() {
    if (this.ship.ai) return 0
    if (this.ship.tutorial?.currentStep?.disableRepair)
      return 0

    const percentLossFromNormalTick = 0.02
    // we replace most of the default loss
    let repairLoss =
      c.getBaseDurabilityLossPerTick(
        this.maxHp,
        this.reliability,
      ) *
      (-1 + percentLossFromNormalTick)
    this.repair -= repairLoss
    if (this.repair < 0) this.repair = 0
    repairLoss += super.use()

    this.ship.updateSightAndScanRadius()
    return repairLoss
  }
}
