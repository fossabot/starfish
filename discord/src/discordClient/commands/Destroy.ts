import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

export class DestroyCommand implements Command {
  commandNames = [`destroy`, `end`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to remove your server from the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    // remove ship
    const res = await ioInterface.ship.destroy(
      context.guild.id,
    )
    c.log(res)
    if (res) context.initialMessage.channel.send(res)
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.dm)
      return `This command can only be invoked in a server.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain or a server admin may run this command.`
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`
    return true
  }
}
