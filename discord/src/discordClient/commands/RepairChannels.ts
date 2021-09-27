import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'
import checkPermissions from '../actions/checkPermissions'

export class RepairChannelsCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`repairchannels`, `rc`, `rch`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Repair the game's Discord channels (should they become unlinked).`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    // first, check to see if we have the necessary permissions to make channels
    const permissionsCheck = await checkPermissions({
      requiredPermissions: [`MANAGE_CHANNELS`],
      channel:
        context.initialMessage.channel.type === `GUILD_TEXT`
          ? context.initialMessage.channel
          : undefined,
      guild: context.guild,
    })
    if (`error` in permissionsCheck) {
      await context.reply(
        `I don't have permission to create channels! Please add that permission and rerun the command.`,
      )
      return
    }

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
}
