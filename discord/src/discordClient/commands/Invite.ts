import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { MessageEmbed } from 'discord.js'

export class InviteCommand implements Command {
  commandNames = [`invite`, `inv`, `i`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Get a game bot invite link.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.reply({
      embeds: [
        new MessageEmbed()
          .setColor(`#FF9F49`)
          .setDescription(
            `:incoming_envelope: [Bot invite link](${c.discordBotInviteUrl})`,
          ),
      ],
    })
  }
}
