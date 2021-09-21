import c from '../../../common/dist'
import {
  Message,
  TextChannel,
  MessageEmbed,
} from 'discord.js'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { reactor } from './reactions/reactor'
import {
  default as ioInterface,
  io as socketIoObject,
} from '../ioInterface'

import { StartCommand } from './commands/Start'
import { InviteCommand } from './commands/Invite'
import { LinkCommand } from './commands/Link'
import { JoinCommand } from './commands/Join'
import { RespawnCommand } from './commands/Respawn'
import { RepairChannelsCommand } from './commands/RepairChannels'
import { BroadcastCommand } from './commands/Broadcast'
import { AlertLevelCommand } from './commands/AlertLevel'
import { ChangeCaptainCommand } from './commands/ChangeCaptain'
import { HelpCommand } from './commands/Help'
import { KickMemberCommand } from './commands/KickMember'
import { LeaveGameCommand } from './commands/LeaveGame'
import { GoCommand } from './commands/Go'
import { ChangeShipNameCommand } from './commands/ShipName'

export class CommandHandler {
  private commands: Command[]

  private readonly prefix: string

  constructor(prefix: string) {
    const commandClasses = [
      StartCommand,
      LeaveGameCommand,
      InviteCommand,
      LinkCommand,
      JoinCommand,
      RespawnCommand,
      RepairChannelsCommand,
      BroadcastCommand,
      AlertLevelCommand,
      ChangeCaptainCommand,
      KickMemberCommand,
      GoCommand,
      ChangeShipNameCommand,
    ]
    this.commands = commandClasses.map(
      (CommandClass) => new CommandClass(),
    )
    this.commands.push(new HelpCommand(this.commands))
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
    if (message.channel.type === `DM` || !message.guild) {
      return
    }

    // initialize command context
    const commandContext = new CommandContext(
      message,
      this.prefix,
    )

    // find matched commands
    const matchedCommands = this.commands.filter(
      (command) => {
        if (
          commandContext.correctPrefix &&
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

    // make sure we're connected to the io server
    if (!socketIoObject.connected) {
      await message.reply({
        embeds: [
          new MessageEmbed({
            description: `It looks like the game server is down at the moment. Please check the [support server](${c.supportServerLink}) for more details.`,
          }),
        ],
      })
      await reactor.warning(message)
      return
    }

    commandContext.matchedCommands = matchedCommands

    // get ship data to determine which commands a user should be able to run.
    const ship = await ioInterface.ship.get(
      message.guild?.id || ``,
      message.author.id,
    )
    commandContext.ship = ship
    const crewMember =
      ship?.crewMembers?.find(
        (cm) => cm.id === message.author.id,
      ) || null
    commandContext.isCaptain =
      Boolean(crewMember) &&
      crewMember?.id === ship?.captain
    commandContext.crewMember = crewMember

    // side effects!
    this.sideEffects(commandContext)

    for (let matchedCommand of matchedCommands) {
      // check run permissions and get error message if relevant
      const permissionRes =
        matchedCommand.hasPermissionToRun(commandContext)
      if (permissionRes !== true) {
        if (permissionRes.length) {
          await message.channel.send(permissionRes)
          await reactor.failure(message)
        }
        continue
      }

      c.log(`gray`, message.content)

      // run command
      await matchedCommand
        .run(commandContext)
        .then(() => {
          // reactor.success(message)
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

  private sideEffects(context: CommandContext) {
    // ----- set nickname -----
    if (
      context.initialMessage.guild?.me?.nickname !==
      `${c.gameName}`
    )
      context.initialMessage.guild?.me?.setNickname(
        `${c.gameName}`,
      )

    // * removed because it would reset ship names willy-nilly, and they can set it manually
    // // ----- update guild name if necessary -----
    // if (context.ship && context.guild) {
    //   if (
    //     c
    //       .sanitize(context.guild.name)
    //       .result.substring(0, c.maxNameLength) !==
    //     context.ship.name
    //   )
    //     ioInterface.ship.rename(
    //       context.ship.id,
    //       context.guild.name,
    //     )
    // }

    // ----- check for crew member still in guild, and update name if necessary -----
    if (context.crewMember) {
      const guildMember =
        context.initialMessage.guild?.members.cache.find(
          (m) => m.user.id === context.crewMember?.id,
        )
      if (!guildMember) {
        c.log(`NO GUILD MEMBER BY THAT NAME`)
      } else if (
        context.ship &&
        context.nickname !== context.crewMember.name
      ) {
        ioInterface.crew.rename(
          context.ship.id,
          context.crewMember.id,
          context.nickname,
        )
      }
    }
  }
}
