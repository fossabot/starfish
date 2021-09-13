import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class ChangeShipNameCommand implements Command {
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
    return `Use \`${commandPrefix}${this.commandNames[0]} <new name>\` to change the ship's name.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return

    let typedName = context.rawArgs
    if (!typedName) {
      await context.initialMessage.channel.send(
        `Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <new name>\`.`,
      )
      return
    }
    typedName = typedName.replace(/(^[\s<]+|[>\s]+$)*/g, ``)

    ioInterface.ship.rename(context.ship.id, typedName)
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain or a server admin can run this command.`
    return true
  }
}
