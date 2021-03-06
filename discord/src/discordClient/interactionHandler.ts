import c from '../../../common/dist'
import {
  Message,
  TextChannel,
  MessageEmbed,
  ColorResolvable,
  CommandInteraction,
} from 'discord.js'
import getInteractionContext, {
  InteractionContext,
} from './models/getInteractionContext'
import type { Command } from './models/Command'
import { default as ioInterface, io as socketIoObject } from '../ioInterface'

export default async function handleInteraction(
  interaction: CommandInteraction,
) {
  if (interaction.member.user.bot) return

  // make sure we're connected to the io server
  if (!socketIoObject.connected) {
    await interaction.reply({
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

  // get ship data to determine which commands a user should be able to run.
  const ship = await ioInterface.ship.get(
    interaction.guild?.id || ``,
    interaction.member.user.id,
  )
  const crewMember = ship?.crewMembers?.find(
    (cm) => cm.id === interaction.member.user.id,
  )

  const context = getInteractionContext(interaction, ship, crewMember)

  if (context.error) {
    await interaction.reply({
      embeds: [
        new MessageEmbed()
          .setColor(c.gameColor as ColorResolvable)
          .setDescription(context.error),
      ],
    })
    return
  }

  sideEffects(context)

  c.log(
    `gray`,
    `${context.nickname} on ${context.ship?.name} ran /${
      context.command?.commandNames[0]
    } ${
      context.args && Object.keys(context.args).length
        ? JSON.stringify(context.args)
        : ``
    }`,
  )

  context.command?.run(context)
}

function sideEffects(context: InteractionContext) {
  // ----- set nickname -----
  if (context.guild?.me?.nickname !== `${c.gameName}`)
    context.guild?.me?.setNickname(`${c.gameName}`)

  // ----- update guild name/icon if necessary -----
  if (context.ship && context.guild) {
    if (
      c.sanitize(context.guild.name).result.substring(0, c.maxNameLength) !==
        context.ship.guildName ||
      context.guild.iconURL({ size: 128 }) !== context.ship.guildIcon
    )
      ioInterface.ship.setGuildData(context.ship.id, {
        guildName:
          c.sanitize(context.guild.name).result.substring(0, c.maxNameLength) ||
          `guild`,
        guildIcon: context.guild.iconURL({ size: 128 }) || undefined,
      })
  }

  // ----- check for crew member still in guild, and update name/icon if necessary -----
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
      context.crewMember.name = context.nickname
      ioInterface.crew.rename(
        context.ship.id,
        context.crewMember.id,
        context.nickname,
      )
    }

    const guildMemberIcon = guildMember?.user.avatarURL({
      size: 32,
    })
    if (
      guildMember &&
      context.ship &&
      context.crewMember &&
      context.crewMember.discordIcon !== guildMemberIcon
    ) {
      c.log(
        `gray`,
        `Auto-changing crew member with different icon:`,
        context.crewMember.name,
      )
      ioInterface.crew.setDiscordIcon(
        context.ship.id,
        context.crewMember.id,
        guildMemberIcon || undefined,
      )
    }
  }
}

/*

  async handleMessage(message: Message): Promise<void> {
    // ----- handle command -----
    if (message.author.bot || !this.couldBeCommand(message)) {
      return
    }

    // ignore DMs for now
    if (message.channel.type === `DM` || !message.guild) {
      return
    }

    // initialize command context
    const commandContext = new CommandContext(message, this.prefix)

    // find matched commands
    const matchedCommands = this.commands.filter((command) => {
      if (
        commandContext.correctPrefix &&
        command.commandNames.includes(commandContext.commandName)
      )
        return true
      if (
        command.ignorePrefixMatchTest &&
        command.ignorePrefixMatchTest(message)
      )
        return true
      return false
    })

    // handle prefix but no valid command case
    if (!matchedCommands.length) {
      if (commandContext.commandName !== commandContext.commandPrefix)
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
      ship?.crewMembers?.find((cm) => cm.id === message.author.id) || null
    commandContext.isCaptain =
      Boolean(crewMember) && crewMember?.id === ship?.captain
    commandContext.crewMember = crewMember

    // side effects!
    this.sideEffects(commandContext)

    for (let matchedCommand of matchedCommands) {
      // check runnability and get error message if relevant
      let runnable: string | true

      if (commandContext.dm && !matchedCommand.allowDm)
        runnable = `The \`${matchedCommand.commandNames[0]}\` can only be invoked in a server.`
      // ship required and no ship
      if (!commandContext.ship && matchedCommand.requiresShip)
        runnable = `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
      // ship required and tutorial
      if (
        commandContext.ship &&
        matchedCommand.requiresShip &&
        ![`leave`, `leavegame`].includes(matchedCommand.commandNames[0]) &&
        commandContext.ship.tutorial
      )
        runnable = `Discord commands are disabled while you're in the tutorial. Go to ${c.frontendUrl} to play!`
      // crewMember required and no crewMember
      else if (!commandContext.crewMember && matchedCommand.requiresCrewMember)
        if (matchedCommand.commandNames.length === 0)
          // broadcast command
          runnable = `Only crew members can send broadcasts. Use \`${commandContext.commandPrefix}join\` to join the ship first.`
        else
          runnable = `Only crew members can run the \`${
            commandContext.commandPrefix
          }${
            matchedCommand?.commandNames?.[0] || commandContext.commandName
          }\` command. Use \`${
            commandContext.commandPrefix
          }join\` to join the ship first.`
      // planet-only command and no planet
      else if (!commandContext.ship?.planet && matchedCommand.requiresPlanet)
        runnable = `Your ship must be on a planet to use the \`${
          commandContext.commandPrefix
        }${
          matchedCommand?.commandNames?.[0] || commandContext.commandName
        }\` command.`
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
        } or a server admin can run the \`${commandContext.commandPrefix}${
          matchedCommand?.commandNames?.[0] || commandContext.commandName
        }\` command.`
      // anything else command-specific
      else if (!matchedCommand.hasPermissionToRun) runnable = true
      else runnable = matchedCommand.hasPermissionToRun(commandContext)
      if (runnable !== true) {
        if (runnable.length) await commandContext.reply(runnable)
        continue
      }

      c.log(
        `gray`,
        `${message.content} (${commandContext.nickname} on ${
          commandContext.ship?.name || commandContext.guild?.name || `PM`
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
    // has 1 but not multiple prefixes (i.e. '...')
    if (
      message.content.startsWith(this.prefix) &&
      !message.content.substring(this.prefix.length).startsWith(this.prefix)
    )
      return true
    if (
      message.channel instanceof TextChannel &&
      message.channel.name.indexOf(`????`) !== -1
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
        c.sanitize(context.guild.name).result.substring(0, c.maxNameLength) !==
          context.ship.guildName ||
        context.guild.iconURL({ size: 128 }) !== context.ship.guildIcon
      )
        ioInterface.ship.setGuildData(context.ship.id, {
          guildName:
            c
              .sanitize(context.guild.name)
              .result.substring(0, c.maxNameLength) || `guild`,
          guildIcon: context.guild.iconURL({ size: 128 }) || undefined,
        })
    }

    // ----- check for crew member still in guild, and update name/icon if necessary -----
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
        context.crewMember.name = context.nickname
        ioInterface.crew.rename(
          context.ship.id,
          context.crewMember.id,
          context.nickname,
        )
      }

      const guildMemberIcon = guildMember?.user.avatarURL({
        size: 32,
      })
      if (
        guildMember &&
        context.ship &&
        context.crewMember &&
        context.crewMember.discordIcon !== guildMemberIcon
      ) {
        c.log(
          `gray`,
          `Auto-changing crew member with different icon:`,
          context.crewMember.name,
        )
        ioInterface.crew.setDiscordIcon(
          context.ship.id,
          context.crewMember.id,
          guildMemberIcon || undefined,
        )
      }
    }
  }
}
*/
