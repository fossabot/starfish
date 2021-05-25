import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { Message, TextChannel } from 'discord.js'
import ioInterface from '../../ioInterface'

export class BroadcastCommand implements Command {
  commandNames = []

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}respawn to get your crew a new ship once you've died.`
  }

  async run(context: CommandContext): Promise<void> {
    if (context.ship) {
      const res = await ioInterface.ship.broadcast(
        context.ship.id,
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
    // commandContext.ship.items.find(antenna)
    return true
  }
}
