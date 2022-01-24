import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import { ColorResolvable, MessageEmbed } from 'discord.js'
import commandList from '../commandList'

const command: CommandStub = {
  replyEphemerally: true,

  commandNames: [`help`],

  getDescription(): string {
    return `See the game's commands and links.`
  },

  async run(context: InteractionContext) {
    function commandToString(command: CommandStub): string {
      let commandString = `\`/${command.commandNames[0]}`
      if (command.args)
        commandString += command.args.map((arg) => ` [${arg.name}]`).join(``)
      commandString += `\``
      return `${commandString} - ${command.getDescription()}`
    }
    await context.reply({
      embeds: [
        new MessageEmbed()
          .setTitle(`Public commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setThumbnail(
            `https://raw.githubusercontent.com/starfishgame/starfish/main/frontend/static/images/icons/bot_icon.png`,
          )
          .setDescription(
            commandList
              .filter(
                (cm) =>
                  !cm.requiresCaptain &&
                  !cm.requiresCrewMember &&
                  !cm.requiresShip,
              )
              .map((cm) => commandToString(cm))
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
          .setTitle(`Crew commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(
            commandList
              .filter(
                (cm) =>
                  (cm.requiresShip || cm.requiresCrewMember) &&
                  !cm.requiresCaptain,
              )
              .map((cm) => commandToString(cm))
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
          .setTitle(`Captain commands`)
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(
            commandList
              .filter((cm) => cm.requiresCaptain)
              .map((cm) => commandToString(cm))
              .filter((m) => m)
              .join(`\n`),
          ),
        new MessageEmbed()
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
  },
}

export default command
