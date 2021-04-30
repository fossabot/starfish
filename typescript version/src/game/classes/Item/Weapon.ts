import c from '../../../common'
import { Ship } from '../Ship/Ship'

import { Item } from './Item'

export class Weapon extends Item {
  readonly range: number

  constructor(data: BaseWeaponData, ship: Ship) {
    super(data, ship)
    this.range = data.range
  }
}
