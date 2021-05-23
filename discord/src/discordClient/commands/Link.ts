import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'

export class LinkCommand implements Command {
  commandNames = [`link`, `url`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}link to get a link to your ship's console.`
  }

  async run({
    initialMessage,
  }: CommandContext): Promise<void> {
    await initialMessage.channel.send(
      `Your ship's console:\n${process.env.FRONTEND_URL}/s`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`
    return true
  }
}
