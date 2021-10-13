import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForSingleButtonChoice from '../actions/waitForSingleButtonChoice'
import { MessageEmbed } from 'discord.js'

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
