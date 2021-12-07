import c from '../../../../../../../common/dist'
import { Game } from '../../../../Game'
import { AIShip } from '../AIShip'
import { CombatShip } from '../../CombatShip'
import type { Ship } from '../../Ship'
import type { Planet } from '../../../Planet/Planet'
import type { Cache } from '../../../Cache'
import type { Zone } from '../../../Zone'
import type { AttackRemnant } from '../../../AttackRemnant'
import type { Weapon } from '../../Item/Weapon'
import type { HumanShip } from '../../HumanShip/HumanShip'

export class FriendlyAIShip extends AIShip {
  scanTypes: ScanType[] = [`humanShip`, `aiShip`]

  spawnedBy?: HumanShip

  constructor(
    data: BaseAIShipData = {} as BaseAIShipData,
    game?: Game,
  ) {
    super(data, game)

    this.swapChassis({ chassisId: `drone1` })
    if (this.items.length === 0)
      this.addItem({ itemId: `drone1`, itemType: `weapon` })

    if (this.spawnedById) {
      this.spawnedBy = this.game?.humanShips.find(
        (s) => s.id === this.spawnedById,
      )
      setTimeout(() => {
        this.spawnedBy = this.game?.humanShips.find(
          (s) => s.id === this.spawnedById,
        )
      }, 10)
    }
  }

  determineTargetShip(): CombatShip | null {
    // * default: aggressive
    const enemies = this.getEnemiesInAttackRange()
    if (!enemies.length) return (this.targetShip = null)
    return (this.targetShip = c.randomFromArray(
      enemies,
    ) as CombatShip)
  }

  logEntry(
    content: LogContent,
    level: LogLevel = `low`,
    icon?: LogIcon,
    isGood?: boolean,
  ) {
    if (this.spawnedBy) {
      const newContent: LogContent = [
        {
          text: `${this.name}:`,
          color: `var(--item)`,
          tooltipData: { type: `ship`, id: this.id },
        },
        ...(typeof content === `string`
          ? [content]
          : content),
      ]
      this.spawnedBy.logEntry(
        newContent,
        `medium`,
        icon,
        isGood,
      )
    }
  }
}
