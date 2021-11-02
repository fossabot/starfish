import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'
import checkPermissions from '../actions/checkPermissions'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

export class RepairChannelsCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`repair`, `rcr`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Attempt to repair the game's Discord channels/roles (should they become unlinked).`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return
    if (!context.ship) return

    // first, check to see if we have the necessary permissions to make channels
    const permissionsCheck = await checkPermissions({
      requiredPermissions: [
        `MANAGE_CHANNELS`,
        `MANAGE_ROLES`,
      ],
      channel:
        context.initialMessage.channel.type === `GUILD_TEXT`
          ? context.initialMessage.channel
          : undefined,
      guild: context.guild,
    })
    if (`error` in permissionsCheck) {
      await context.reply(
        `I don't have permission to create channels/roles! Please add those permissions and rerun the command.`,
      )
      return
    }

    // roles
    await resolveOrCreateRole({
      type: `crew`,
      context,
    })

    // channels
    await resolveOrCreateChannel({
      type: `alert`,
      context,
    })
    await resolveOrCreateChannel({
      type: `chat`,
      context,
    })
    await resolveOrCreateChannel({
      type: `broadcast`,
      context,
    })

    context.sendToGuild(`Channels repaired.`)
  }
}
