import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForSingleButtonChoice from '../actions/waitForSingleButtonChoice'
import { MessageEmbed } from 'discord.js'
import { ShipLeaveGameCommand } from './ShipLeaveGame'

export class CrewLeaveGameCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`leave`, `leaveship`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Your crew member leaves the ship. This action is permanent.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return
    if (!context.crewMember) return

    if (context.ship.crewMembers?.length === 1) {
      context.reply({
        embeds: [
          new MessageEmbed({
            color: `RED`,
            title: `You're the only crew member left!`,
            description: `Use \`${context.commandPrefix}${
              new ShipLeaveGameCommand().commandNames[0]
            }\` instead to remove your ship fully from the game.`,
          }),
        ],
      })
      return
    }

    const {
      result: deleteChannelsConfirmResult,
      sentMessage: pm,
    } = await waitForSingleButtonChoice({
      context,
      content: [
        new MessageEmbed({
          color: `RED`,
          title: `Wait, really?`,
          description: `This will **permanently** delete your crew member from the ship.

Is that okay with you?`,
        }),
      ],
      allowedUserId: context.initialMessage.author.id,
      buttons: [
        {
          label: `Leave Game`,
          style: `DANGER`,
          customId: `leaveGameYes`,
        },
        {
          label: `Don't Leave Game`,
          style: `SECONDARY`,
          customId: `leaveGameNo`,
        },
      ],
    })
    if (pm) pm.delete().catch((e) => {})

    if (
      !deleteChannelsConfirmResult ||
      deleteChannelsConfirmResult === `leaveGameNo`
    ) {
      await context.reply(`Ah, okay. Glad to hear it!`)
      return
    }

    const res = await ioInterface.crew.leave(
      context.ship.id,
      context.crewMember.id,
    )
    if (res) {
      await context.reply(res)
    }
  }
}
