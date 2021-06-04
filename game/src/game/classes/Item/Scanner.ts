import c from '../../../../../common/dist'
import type { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Scanner extends Item {
  readonly id: ScannerId
  readonly sightRange: number
  readonly shipScanRange: number
  readonly shipScanData: ShipScanDataShape

  constructor(
    data: BaseScannerData,
    ship: Ship,
    props?: Partial<BaseScannerData>,
  ) {
    super(data, ship, props)
    this.id = data.id
    this.sightRange = data.sightRange
    this.shipScanRange = data.shipScanRange
    this.shipScanData = data.shipScanData
  }

  use() {
    if (this.ship.ai) return 0
    let repairLoss =
      c.getBaseDurabilityLossPerTick(this.maxHp) * -0.97
    this.repair -= repairLoss
    repairLoss += super.use()
    return repairLoss
  }
}
