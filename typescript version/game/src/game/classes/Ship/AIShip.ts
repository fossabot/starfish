import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { Faction } from '../Faction'
import { CombatShip } from './CombatShip'

export class AIShip extends CombatShip {
  readonly human: boolean
  readonly id: string
  readonly faction: Faction | null

  obeysGravity = false

  constructor(data: BaseShipData, game: Game) {
    super(data, game)
    this.human = false
    if (data.id) this.id = data.id
    else this.id = `${Math.random()}`.substring(2)
    this.faction =
      game.factions.find((f) => f.ai === true) || null
  }

  tick() {
    super.tick()
    // attack human in range
    const weapons = this.availableWeapons
    if (!weapons) return
    const enemies = this.enemiesInAttackRange
    if (enemies.length) {
      const randomEnemy = c.randomFromArray(enemies)
      const randomWeapon = c.randomFromArray(weapons)
      this.attack(randomEnemy, randomWeapon)
    }
  }
}
