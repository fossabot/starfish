import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { Message, TextChannel } from 'discord.js'
import ioInterface from '../../ioInterface'

export class BroadcastCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = []

  getHelpMessage(commandPrefix: string): string {
    return ``
  }

  async run(context: CommandContext): Promise<void> {
    if (context.ship) {
      const res = await ioInterface.ship.broadcast(
        context.ship.id,
        context.initialMessage.author.id,
        context.initialMessage.content,
      )
      if (res.error)
        context.sendToGuild(res.error, `broadcast`)
      if (res.data !== undefined)
        context.reactToInitialMessage(
          c.numberToEmoji(res.data),
        )
    }
  }

  ignorePrefixMatchTest(message: Message): boolean {
    if (
      message.channel instanceof TextChannel &&
      message.channel.name === `📣comms-bay`
    )
      return true
    return false
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.matchedCommands.length > 1) return ``
    return true
  }
}
