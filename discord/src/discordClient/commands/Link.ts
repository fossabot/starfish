import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import { MessageEmbed, ColorResolvable } from 'discord.js'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`link`, `invite`],

  getDescription(): string {
    return `Get some useful ${c.gameName} links.`
  },

  async run(context: InteractionContext) {
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
  },
}

export default command
