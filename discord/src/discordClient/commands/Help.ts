import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import {
  MessageEmbed,
  MessageOptions,
  ColorResolvable,
} from 'discord.js'

export class HelpCommand implements Command {
  commandsToList: Command[] = []
  commandNames = [`help`, `h`, `i`, `info`]

  constructor(commands: Command[]) {
    this.commandsToList = [...commands]
    this.commandsToList.push(this)
  }

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - See the game's Discord commands.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Public commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setThumbnail(
            `https://raw.githubusercontent.com/starfishgame/starfish/main/frontend/static/images/icons/bot_icon.png`,
          )
          .setDescription(
            this.commandsToList
              .filter(
                (cm) =>
                  !cm.requiresCaptain &&
                  !cm.requiresCrewMember &&
                  !cm.requiresShip,
              )
              .map((cm) =>
                cm.getHelpMessage(context.commandPrefix),
              )
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
          .setTitle(`Crew commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(
            this.commandsToList
              .filter(
                (cm) =>
                  (cm.requiresShip ||
                    cm.requiresCrewMember) &&
                  !cm.requiresCaptain,
              )
              .map((cm) =>
                cm.getHelpMessage(context.commandPrefix),
              )
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
          .setTitle(`Captain commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(
            this.commandsToList
              .filter((cm) => cm.requiresCaptain)
              .map((cm) =>
                cm.getHelpMessage(context.commandPrefix),
              )
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
          .setTitle(`Captain commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(
            `:desktop: [Ship console](${c.frontendUrl})` +
              `\n\n` +
              `:incoming_envelope: [Bot invite](${c.discordBotInviteUrl})` +
              `\n\n` +
              `:information_source: [Support server](${c.supportServerLink})`,
          ),
      ],
    })
  }
}
