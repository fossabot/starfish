import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { CombatShip } from './CombatShip'

export class HumanShip extends CombatShip {
  readonly human: boolean
  readonly id: string

  constructor(data: BaseHumanShipData, game: Game) {
    super(data, game)
    this.human = true
    this.id = data.id
    //* id matches discord guildId here
  }
}
