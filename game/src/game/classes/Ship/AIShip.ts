import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { Faction } from '../Faction'
import { CombatShip } from './CombatShip'

export class AIShip extends CombatShip {
  readonly human: boolean = false
  readonly id: string
  readonly faction: Faction | false
  level = 1

  obeysGravity = false

  constructor(data: BaseShipData, game: Game) {
    super(data, game)
    if (data.id) this.id = data.id
    else this.id = `${Math.random()}`.substring(2)
    this.faction =
      game.factions.find((f) => f.ai === true) || false
  }

  tick() {
    super.tick()

    // recharge weapons
    this.weapons.forEach(
      (w) =>
        (w.cooldownRemaining -= c.deltaTime * this.level),
    )

    // attack human in range
    const weapons = this.availableWeapons()
    if (!weapons.length) return
    const enemies = this.getEnemiesInAttackRange()
    if (enemies.length) {
      const randomEnemy = c.randomFromArray(enemies)
      const randomWeapon = c.randomFromArray(weapons)
      this.attack(randomEnemy, randomWeapon)
    }
  }

  cumulativeSkillIn(l: CrewLocation, s: SkillName) {
    return this.level
  }
}
