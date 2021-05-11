import c from '../../../../../common/dist'
import { Message } from 'discord.js'
import { StartCommand } from '../start'
// import { HelpCommand } from './commands/help'
import { CommandContext } from './CommandContext'
import type { Command } from './Command'
import { reactor } from '../../reactions/reactor'

export class CommandHandler {
  private commands: Command[]

  private readonly prefix: string

  constructor(prefix: string) {
    const commandClasses = [StartCommand]
    this.commands = commandClasses.map(
      (CommandClass) => new CommandClass(),
    )
    // this.commands.push(new HelpCommand(this.commands))
    this.prefix = prefix
  }

  async handleMessage(message: Message): Promise<void> {
    if (
      message.author.bot ||
      !this.couldBeCommand(message)
    ) {
      return
    }
    // ignore DMs for now
    if (message.channel.type === 'dm') {
      return
    }

    const commandContext = new CommandContext(
      message,
      this.prefix,
    )

    const matchedCommand = this.commands.find((command) =>
      command.commandNames.includes(
        commandContext.parsedCommandName,
      ),
    )

    if (!matchedCommand) {
      await message.reply(
        `I don't recognize that command. Try ${this.prefix}help.`,
      )
      await reactor.failure(message)
      return
    }

    // at this point, we need game data to determine which commands a user should be able to run.

    const allowedCommands = this.commands.filter(
      (command) =>
        command.hasPermissionToRun(commandContext),
    )
    if (!allowedCommands.includes(matchedCommand)) {
      await message.reply(
        `You aren't allowed to use that command. Try ${this.prefix}help.`,
      )
      await reactor.failure(message)
      return
    }

    await matchedCommand
      .run(commandContext)
      .then(() => {
        reactor.success(message)
      })
      .catch((reason) => {
        reactor.failure(message)
      })
  }

  private couldBeCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix)
  }
}
