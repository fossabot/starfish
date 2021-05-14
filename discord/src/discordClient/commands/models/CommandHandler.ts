import c from '../../../../../common/dist'
import { Message } from 'discord.js'
import { CommandContext } from './CommandContext'
import type { Command } from './Command'
import { reactor } from '../../reactions/reactor'
import { get } from '../../../ioInterface/ship'

import { StartCommand } from '../Start'
import { InviteCommand } from '../Invite'
import { LinkCommand } from '../Link'

export class CommandHandler {
  private commands: Command[]

  private readonly prefix: string

  constructor(prefix: string) {
    const commandClasses = [
      StartCommand,
      InviteCommand,
      LinkCommand,
    ]
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
    if (message.channel.type === `dm`) {
      return
    }

    // initialize command context
    const commandContext = new CommandContext(
      message,
      this.prefix,
    )

    // find matched command
    const matchedCommand = this.commands.find((command) =>
      command.commandNames.includes(
        commandContext.commandName,
      ),
    )

    // handle prefix but no valid command case
    if (!matchedCommand) {
      await message.reply(
        `I don't recognize that command. Try ${this.prefix}help.`,
      )
      await reactor.failure(message)
      return
    }

    // get ship data to determine which commands a user should be able to run.
    const ship = await get(message.guild?.id || ``)
    commandContext.ship = ship
    const crewMember =
      ship?.crewMembers.find(
        (cm) => cm.id === message.author.id,
      ) || null
    commandContext.crewMember = crewMember

    // check run permissions and get error message if relevant
    const permissionRes = matchedCommand.hasPermissionToRun(
      commandContext,
    )
    if (permissionRes !== true) {
      await message.channel.send(permissionRes)
      await reactor.failure(message)
      return
    }

    c.log(`gray`, message.content)

    // run command
    await matchedCommand
      .run(commandContext)
      .then(() => {
        reactor.success(message)
      })
      .catch((reason) => {
        c.log(
          `red`,
          `Failed to run command ${commandContext.commandName}: ${reason}`,
        )
        reactor.failure(message)
      })
  }

  private couldBeCommand(message: Message): boolean {
    return message.content.startsWith(this.prefix)
  }
}
