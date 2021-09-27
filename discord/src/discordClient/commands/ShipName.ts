import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class ChangeShipNameCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [
    `shipname`,
    `changeshipname`,
    `rename`,
    `renameship`,
    `name`,
    `changename`,
    `sn`,
  ]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <new name>\` - Change the ship's name.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return

    let typedName = context.rawArgs
    if (!typedName) {
      await context.reply(
        `Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <new name>\`.`,
      )
      return
    }
    typedName = typedName.replace(/(^[\s<]+|[>\s]+$)*/g, ``)

    ioInterface.ship.rename(context.ship.id, typedName)
  }
}
