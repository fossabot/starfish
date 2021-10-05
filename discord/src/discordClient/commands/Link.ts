import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { MessageEmbed, ColorResolvable } from 'discord.js'

export class LinkCommand implements Command {
  requiresShip = true

  commandNames = [`link`, `links`, `url`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Get some useful Starfish links.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.reply({
      embeds: [
        new MessageEmbed()
          .setColor(c.gameColor as ColorResolvable)
          .setTitle(`Starfish Links`)
          .setThumbnail(
            `https://raw.githubusercontent.com/starfishgame/starfish/main/frontend/static/images/icons/bot_icon.png`,
          )
          .setDescription(
            `:desktop: [Ship console](${c.frontendUrl})\n\n:incoming_envelope: [Bot invite](${c.discordBotInviteUrl})\n\n:information_source: [Support server](${c.supportServerLink})`,
          ),
      ],
    })
  }
}
