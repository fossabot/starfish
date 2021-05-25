import c from '../../../common/dist'
import { Message, TextChannel } from 'discord.js'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { reactor } from './reactions/reactor'
import ioInterface from '../ioInterface'

import { StartCommand } from './commands/Start'
import { InviteCommand } from './commands/Invite'
import { LinkCommand } from './commands/Link'
import { JoinCommand } from './commands/Join'
import { RespawnCommand } from './commands/Respawn'
import { RepairChannelsCommand } from './commands/RepairChannels'
import { BroadcastCommand } from './commands/Broadcast'

export class CommandHandler {
  private commands: Command[]

  private readonly prefix: string

  constructor(prefix: string) {
    const commandClasses = [
      StartCommand,
      InviteCommand,
      LinkCommand,
      JoinCommand,
      RespawnCommand,
      RepairChannelsCommand,
      BroadcastCommand,
    ]
    this.commands = commandClasses.map(
      (CommandClass) => new CommandClass(),
    )
    // this.commands.push(new HelpCommand(this.commands))
    this.prefix = prefix
  }

  async handleMessage(message: Message): Promise<void> {
    // ----- handle command -----
    if (
      message.author.bot ||
      !this.couldBeCommand(message)
    ) {
      return
    }

    // ignore DMs for now
    if (message.channel.type === `dm` || !message.guild) {
      return
    }

    this.sideEffects(message)

    // initialize command context
    const commandContext = new CommandContext(
      message,
      this.prefix,
    )

    // find matched commands
    const matchedCommands = this.commands.filter(
      (command) => {
        if (
          command.commandNames.includes(
            commandContext.commandName,
          )
        )
          return true
        if (
          command.ignorePrefixMatchTest &&
          command.ignorePrefixMatchTest(message)
        )
          return true
        return false
      },
    )

    // handle prefix but no valid command case
    if (!matchedCommands.length) {
      await message.reply(
        `I don't recognize that command. Try ${this.prefix}help.`,
      )
      await reactor.failure(message)
      return
    }

    // get ship data to determine which commands a user should be able to run.
    const ship = await ioInterface.ship.get(
      message.guild?.id || ``,
    )
    commandContext.ship = ship
    const crewMember =
      ship?.crewMembers.find(
        (cm) => cm.id === message.author.id,
      ) || null
    commandContext.crewMember = crewMember

    for (let matchedCommand of matchedCommands) {
      // check run permissions and get error message if relevant
      const permissionRes =
        matchedCommand.hasPermissionToRun(commandContext)
      if (permissionRes !== true) {
        await message.channel.send(permissionRes)
        await reactor.failure(message)
        continue
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
  }

  private couldBeCommand(message: Message): boolean {
    if (message.content.startsWith(this.prefix)) return true
    if (
      message.channel instanceof TextChannel &&
      message.channel.name.indexOf(`📣`) !== -1
    )
      return true
    return false
  }

  private sideEffects(message: Message) {
    // ----- set nickname -----
    if (message.guild?.me?.nickname !== `${c.GAME_NAME}`)
      message.guild?.me?.setNickname(`${c.GAME_NAME}`)
  }
}
