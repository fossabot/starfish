import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'

export class HelpCommand implements Command {
  commandsToList: Command[] = []
  commandNames = [`help`, `h`]

  constructor(commands: Command[]) {
    this.commandsToList = [...commands]
    this.commandsToList.push(this)
  }

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to see the game's Discord commands.`
  }

  async run(context: CommandContext): Promise<void> {
    await context.initialMessage.channel.send(
      this.commandsToList
        .map((cm) =>
          cm.getHelpMessage(context.commandPrefix),
        )
        .filter((m) => m)
        .join(`\n`) +
        `\n\n` +
        `Your ship's console:\n<${c.frontendUrl}/s>\n\nBot invite link:\n<${c.discordBotInviteUrl}>`,
    )
  }

  hasPermissionToRun(): string | true {
    return true
  }
}