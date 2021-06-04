import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'

export class RepairChannelsCommand implements Command {
  commandNames = [`repairchannels`, `repair`, `rc`, `rch`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to repair the game's Discord channels (should they become unlinked).`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return
    await resolveOrCreateChannel({
      type: `alert`,
      guild: context.guild,
    })
    await resolveOrCreateChannel({
      type: `chat`,
      guild: context.guild,
    })
    await resolveOrCreateChannel({
      type: `broadcast`,
      guild: context.guild,
    })
    context.sendToGuild(`Channels repaired.`)
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.dm)
      return `This command can only be invoked in a server.`
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain or a server admin may run this command.`
    return true
  }
}
