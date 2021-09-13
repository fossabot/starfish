import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'
import {
  MessageButton,
  MessageActionRow,
  MessageComponent,
} from 'discord-buttons'
import type { Message } from 'discord.js'

export class StartCommand implements Command {
  commandNames = [`start`, `s`, `spawn`, `begin`, `init`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to start your server off in the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    const sentMessages: Message[] = []

    const permissionToAddChannelsRow: MessageActionRow =
      new MessageActionRow()
    permissionToAddChannelsRow.addComponent(
      new MessageButton()
        .setLabel(`Okay!`)
        .setStyle(1)
        .setID(`permissionToAddChannelsYes`),
    )
    permissionToAddChannelsRow.addComponent(
      new MessageButton()
        .setLabel(`Nope.`)
        .setStyle(2)
        .setID(`permissionToAddChannelsNo`),
    )

    const pm = await context.initialMessage.channel.send(
      `Welcome to **${c.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.

This bot will create several channels for game communication and a role for crew members. Is that okay with you?`,
      {
        // @ts-ignore
        components: [permissionToAddChannelsRow],
      },
    )
    if (pm && Array.isArray(pm)) sentMessages.push(...pm)
    else if (pm) sentMessages.push(pm)

    const permissionResult = await new Promise<
      string | null
    >((resolve) => {
      let done = false

      const filter = (button: any) =>
        button.clicker.user.id ===
        context.initialMessage.author.id

      // @ts-ignore
      const collector = pm.createButtonCollector(filter, {
        time: 5 * 60 * 1000, // 5 mins
      })

      collector.on?.(`collect`, (b: MessageComponent) => {
        done = true
        b.defer()
        resolve(b.id)
      })
      collector.on?.(`end`, () => {
        if (done) return
        resolve(null)
      })
    })

    if (
      !permissionResult ||
      permissionResult === `permissionToAddChannelsNo`
    ) {
      await context.initialMessage.channel.send(
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
    //   await context.initialMessage.channel.send(
    //     `I don't seem to be able to create roles in this server. Please add that permission to the bot!`,
    //   )
    //   return
    // }
    // context.guildMember?.roles.add(crewRole).catch(async (e) => {
    //   c.log(e)
    //   await context.initialMessage.channel.send(
    //     `I don't seem to be able to assign roles in this server. Please add that permission to the bot!`,
    //   )
    // })

    const speciesRows: MessageActionRow[] = []
    for (let s of c.shuffleArray(
      Object.entries(c.species).filter(
        (e: [string, BaseSpeciesData]) => {
          return e[1].factionId !== `red`
        },
      ),
    )) {
      if (
        !speciesRows.length ||
        speciesRows[speciesRows.length - 1].components
          .length >= 4
      )
        speciesRows.push(new MessageActionRow())
      let row = speciesRows[speciesRows.length - 1]
      row.addComponent(
        new MessageButton()
          .setLabel(s[1].icon + c.capitalize(s[1].id))
          .setStyle(2)
          .setID(s[1].id),
      )
    }

    const sm = await context.initialMessage.channel.send(
      `Excellent! Choose your ship's species to get started.`,
      {
        // @ts-ignore
        components: speciesRows,
      },
    )
    if (sm && Array.isArray(sm)) sentMessages.push(...sm)
    else if (sm) sentMessages.push(sm)

    const speciesKey = await new Promise<SpeciesKey | null>(
      (resolve) => {
        let done = false

        const filter = (button: any) =>
          button.clicker.user.id ===
          context.initialMessage.author.id

        // @ts-ignore
        const collector = sm.createButtonCollector(filter, {
          time: 5 * 60 * 1000, // 5 mins
        })

        collector.on?.(`collect`, (b: MessageComponent) => {
          done = true
          b.defer()
          resolve(b.id as SpeciesKey)
        })
        collector.on?.(`end`, () => {
          if (done) return
          resolve(null)
        })
      },
    )

    // clean up messages
    try {
      for (let m of sentMessages)
        if (m.deletable) m.delete().catch(c.log)
    } catch (e) {}

    if (!speciesKey) {
      await context.initialMessage.channel.send(
        `You didn't pick a species, try again!`,
      )
      return
    }

    // add ship
    const createdShip = await ioInterface.ship.create({
      id: context.guild.id,
      name: context.guild.name,
      species: { id: speciesKey },
    })
    if (!createdShip) {
      await context.initialMessage.channel.send(
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
      await context.initialMessage.channel.send(
        `Failed to add you as a member of the crew.`,
      )
    }
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.dm)
      return `This command can only be invoked in a server.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain or a server admin may run this command.`
    if (commandContext.ship)
      return `Your server already has a ship! It's called ${commandContext.ship.name}.`
    return true
  }
}
