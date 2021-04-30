import c from '../../../common'
import { Ship } from './Ship'

import { attack, takeDamage } from './addins/combat'

export class CombatShip extends Ship {
  hp = 10

  attack = attack
  takeDamage = takeDamage
}
