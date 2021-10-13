import c from '../../../common/dist'
import {
  Message,
  TextChannel,
  MessageEmbed,
  ColorResolvable,
} from 'discord.js'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import {
  default as ioInterface,
  io as socketIoObject,
} from '../ioInterface'

import { StartCommand } from './commands/Start'
import { LinkCommand } from './commands/Link'
import { JoinCommand } from './commands/Join'
import { RespawnCommand } from './commands/Respawn'
import { RepairChannelsCommand } from './commands/RepairChannels'
import { BroadcastCommand } from './commands/Broadcast'
import { AlertLevelCommand } from './commands/AlertLevel'
import { ChangeCaptainCommand } from './commands/ChangeCaptain'
import { HelpCommand } from './commands/Help'
import { KickMemberCommand } from './commands/KickMember'
import { ShipLeaveGameCommand } from './commands/ShipLeaveGame'
import { GoCommand } from './commands/Go'
import { ChangeShipNameCommand } from './commands/ShipName'
import { ThrustCommand } from './commands/Thrust'
import { BrakeCommand } from './commands/Brake'
import { StatusCommand } from './commands/Status'
import { RepairCommand } from './commands/Repair'
import { BunkCommand } from './commands/Bunk'
import { WeaponsCommand } from './commands/Weapons'
import { MineCommand } from './commands/Mine'
import { CockpitCommand } from './commands/Cockpit'
import { BuyCommand } from './commands/Buy'
import { SellCommand } from './commands/Sell'
import { CrewLeaveGameCommand } from './commands/CrewLeaveGame'

export class CommandHandler {
  private commands: Command[]

  private readonly prefix: string

  constructor(prefix: string) {
    const commandClasses = [
      StartCommand,
      JoinCommand,
      LinkCommand,
      StatusCommand,
      BroadcastCommand,
      GoCommand,
      ThrustCommand,
      BrakeCommand,
      BuyCommand,
      SellCommand,
      RepairCommand,
      BunkCommand,
      WeaponsCommand,
      MineCommand,
      CockpitCommand,
      RespawnCommand,
      ChangeShipNameCommand,
      AlertLevelCommand,
      ChangeCaptainCommand,
      KickMemberCommand,
      RepairChannelsCommand,
      ShipLeaveGameCommand,
      CrewLeaveGameCommand,
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
      return
    }

    // make sure we're connected to the io server
    if (!socketIoObject.connected) {
      await commandContext.reply({
        embeds: [
          new MessageEmbed()
            .setColor(c.gameColor as ColorResolvable)
            .setThumbnail(
              `https://raw.githubusercontent.com/starfishgame/starfish/main/frontend/static/images/icons/bot_icon.png`,
            )
            .setDescription(
              `It looks like the game server is down at the moment. Please check the [support server](${c.supportServerLink}) for more details.`,
            ),
        ],
      })
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
      // check runnability and get error message if relevant
      let runnable: string | true

      if (commandContext.dm && !matchedCommand.allowDm)
        runnable = `The \`${matchedCommand.commandNames[0]}\` can only be invoked in a server.`
      // ship required and no ship
      if (
        !commandContext.ship &&
        matchedCommand.requiresShip
      )
        runnable = `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
      // crewMember required and no crewMember
      else if (
        !commandContext.crewMember &&
        matchedCommand.requiresCrewMember
      )
        runnable = `Only crew members can run the \`${commandContext.commandPrefix}${matchedCommand.commandNames[0]}\` command. Use \`${commandContext.commandPrefix}join\` to join the ship first.`
      // planet-only command and no planet
      else if (
        !commandContext.ship?.planet &&
        matchedCommand.requiresPlanet
      )
        runnable = `Your ship must be on a planet to use the \`${commandContext.commandPrefix}${matchedCommand.commandNames[0]}\` command.`
      // captain-only command and not captain or admin
      else if (
        matchedCommand.requiresCaptain &&
        !commandContext.isCaptain &&
        !commandContext.isServerAdmin &&
        !commandContext.isGameAdmin
      )
        runnable = `Only captain ${
          commandContext.ship!.crewMembers?.find(
            (cm) => cm.id === commandContext.ship?.captain,
          )?.name
        } or a server admin can run the \`${
          commandContext.commandPrefix
        }${matchedCommand.commandNames[0]}\` command.`
      // anything else command-specific
      else if (!matchedCommand.hasPermissionToRun)
        runnable = true
      else
        runnable =
          matchedCommand.hasPermissionToRun(commandContext)
      if (runnable !== true) {
        if (runnable.length)
          await commandContext.reply(runnable)
        continue
      }

      c.log(
        `gray`,
        `${message.content} (${
          commandContext.nickname
        } on ${
          commandContext.ship?.name ||
          commandContext.guild?.name ||
          `PM`
        })`,
      )

      // run command
      await matchedCommand
        .run(commandContext)
        .then(() => {})
        .catch((reason) => {
          c.log(
            `red`,
            `Failed to run command ${commandContext.commandName}: ${reason}`,
          )
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
    if (context.guild?.me?.nickname !== `${c.gameName}`)
      context.guild?.me?.setNickname(`${c.gameName}`)

    // ----- update guild name/icon if necessary -----
    if (context.ship && context.guild) {
      if (
        c
          .sanitize(context.guild.name)
          .result.substring(0, c.maxNameLength) !==
          context.ship.guildName ||
        context.guild.iconURL({ size: 128 }) !==
          context.ship.guildIcon
      )
        ioInterface.ship.setGuildData(context.ship.id, {
          guildName:
            c
              .sanitize(context.guild.name)
              .result.substring(0, c.maxNameLength) ||
            `guild`,
          guildIcon:
            context.guild.iconURL({ size: 128 }) ||
            undefined,
        })
    }

    // ----- check for crew member still in guild, and update name if necessary -----
    if (context.crewMember) {
      const guildMember = context.guild?.members.cache.find(
        (m) => m.user.id === context.crewMember?.id,
      )
      if (
        guildMember &&
        context.ship &&
        context.nickname !== context.crewMember.name
      ) {
        c.log(
          `gray`,
          `Auto-renaming crew member with different name:`,
          context.crewMember.name,
          `to`,
          context.nickname,
        )
        ioInterface.crew.rename(
          context.ship.id,
          context.crewMember.id,
          context.nickname,
        )
      }
    }
  }
}
