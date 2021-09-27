import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { MessageEmbed } from 'discord.js'

export class LinkCommand implements Command {
  requiresShip = true

  commandNames = [`link`, `url`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Get a link to your ship's console.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.reply({
      embeds: [
        new MessageEmbed({
          description: `[Ship console](${c.frontendUrl})\n\n[Bot invite](${c.discordBotInviteUrl})\n\n[Support server](${c.supportServerLink})`,
        }),
      ],
    })
  }
}
