import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
// import resolveOrCreateRole from '../actions/resolveOrCreateRole'
import {
  Message,
  MessageActionRow,
  MessageButton,
  MessageButtonOptions,
  MessageComponent,
  MessageComponentInteraction,
} from 'discord.js'
import waitForSingleButtonChoice from '../actions/waitForSingleButtonChoice'
import checkPermissions from '../actions/checkPermissions'

export class StartCommand implements Command {
  requiresCaptain = true

  commandNames = [`start`, `st`, `spawn`, `begin`, `init`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Start your server off in the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    // first, check to see if we have the necessary permissions to make channels
    const permissionsCheck = await checkPermissions({
      requiredPermissions: [`MANAGE_CHANNELS`],
      channel:
        context.initialMessage.channel.type === `GUILD_TEXT`
          ? context.initialMessage.channel
          : undefined,
      guild: context.guild,
    })
    if (`error` in permissionsCheck) {
      await context.reply(
        `I don't have permission to create channels! Please add that permission and rerun the command.`,
      )
      return
    }

    const sentMessages: Message[] = []

    const {
      result: permissionToCreateChannelsResult,
      sentMessage: pm,
    } = await waitForSingleButtonChoice({
      context,
      content: `Welcome to **${c.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.
    
This bot will create several channels for game communication and a role for crew members. Is that okay with you?`,
      allowedUserId: context.initialMessage.author.id,
      buttons: [
        {
          label: `Okay!`,
          style: `PRIMARY`,
          customId: `permissionToAddChannelsYes`,
        },
        {
          label: `Nope.`,
          style: `SECONDARY`,
          customId: `permissionToAddChannelsNo`,
        },
      ],
    })
    if (pm) pm.delete().catch((e) => {})

    if (
      !permissionToCreateChannelsResult ||
      permissionToCreateChannelsResult ===
        `permissionToAddChannelsNo`
    ) {
      await context.reply(
        `Ah, okay. This game might not be for you, then.`,
      )
      return
    }

    // // create role
    // const crewRole = await resolveOrCreateRole({
    //   type: `crew`,
    //   guild: context.guild,
    // })
    // if (!crewRole) {
    //   await context.reply(
    //     `I don't seem to be able to create roles in this server. Please add that permission to the bot!`,
    //   )
    //   return
    // }
    // context.guildMember?.roles.add(crewRole).catch(async (e) => {
    //   c.log(e)
    //   await context.reply(
    //     `I don't seem to be able to assign roles in this server. Please add that permission to the bot!`,
    //   )
    // })

    // const speciesButtonData: MessageButtonOptions[] = []
    // for (let s of c.shuffleArray(
    //   Object.entries(c.species).filter(
    //     (e: [string, BaseSpeciesData]) => {
    //       return e[1].factionId !== `red`
    //     },
    //   ),
    // ))
    //   speciesButtonData.push({
    //     label: s[1].icon + c.capitalize(s[1].id),
    //     style: `SECONDARY`,
    //     customId: s[1].id,
    //   })

    // const { result: speciesResult, sentMessage: sm } =
    //   await waitForSingleButtonChoice<SpeciesId>({
    //     context,
    //     content: `Excellent! Choose your ship's species to get started.`,
    //     allowedUserId: context.initialMessage.author.id,
    //     buttons: speciesButtonData,
    //   })
    // if (sm) sentMessages.push(sm)

    // clean up messages
    try {
      for (let m of sentMessages)
        if (m.deletable) m.delete().catch(c.log)
    } catch (e) {}

    // if (!speciesResult) {
    //   await context.reply(
    //     `You didn't pick a species, try again!`,
    //   )
    //   return
    // }

    // add ship
    const createdShip = await ioInterface.ship.create({
      id: context.guild.id,
      name: context.guild.name,
      guildName:
        c
          .sanitize(context.guild.name)
          .result.substring(0, c.maxNameLength) || `guild`,
      guildIcon:
        context.guild.iconURL({ size: 128 }) || undefined,
    })
    if (!createdShip) {
      await context.reply(
        `Failed to start your server in the game.`,
      )
      return
    }

    // add crew member
    const addedCrewMember = await ioInterface.crew.add(
      createdShip.id,
      {
        name: context.nickname,
        id: context.initialMessage.author.id,
      },
    )
    if (!addedCrewMember) {
      await context.reply(
        `Failed to add you as a member of the crew.`,
      )
    }
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.ship)
      return `Your server already has a ship! It's called ${commandContext.ship.name}.`
    return true
  }
}
