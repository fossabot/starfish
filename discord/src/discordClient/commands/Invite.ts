import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { MessageEmbed } from 'discord.js'

export class InviteCommand implements Command {
  commandNames = [`invite`, `inv`, `i`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to get a game bot invite link.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.reply({
      embeds: [
        new MessageEmbed({
          description: `[Bot invite link](${c.discordBotInviteUrl})`,
        }),
      ],
    })
  }

  hasPermissionToRun(): string | true {
    return true
  }
}
