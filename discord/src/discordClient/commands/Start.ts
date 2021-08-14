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

export class StartCommand implements Command {
  commandNames = [`start`, `s`, `spawn`, `begin`, `init`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to start your server off in the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    const rows: MessageActionRow[] = []
    for (let s of c.shuffleArray(
      Object.entries(c.species).filter(
        (e: [string, BaseSpeciesData]) => {
          return e[1].factionId !== `red`
        },
      ),
    )) {
      if (
        !rows.length ||
        rows[rows.length - 1].components.length >= 4
      )
        rows.push(new MessageActionRow())
      let row = rows[rows.length - 1]
      row.addComponent(
        new MessageButton()
          .setLabel(s[1].icon + c.capitalize(s[1].id))
          .setStyle(2)
          .setID(s[1].id),
      )
    }

    const sentMessage =
      await context.initialMessage.channel.send(
        `Welcome to **${c.gameName}**!
This is a game about exploring the universe in a ship crewed by your server's members, going on adventures and overcoming challenges.

Choose your ship's species to get started!`,
        {
          // @ts-ignore
          components: rows,
        },
      )

    const speciesKey = await new Promise<SpeciesKey | null>(
      (resolve) => {
        let done = false

        const filter = (button: any) =>
          button.clicker.user.id ===
          context.initialMessage.author.id

        // @ts-ignore
        const collector = sentMessage.createButtonCollector(
          filter,
          {
            time: 5 * 60 * 1000, // 5 mins
          },
        )

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

    // clean up buttons
    try {
      if (sentMessage.deletable)
        sentMessage.delete().catch(c.log)
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

    const addedCrewMember = await ioInterface.crew.add(
      createdShip.id,
      {
        name: context.nickname,
        id: context.initialMessage.author.id,
      },
    )

    const crewRole = await resolveOrCreateRole({
      type: `crew`,
      guild: context.guild,
    })
    if (!crewRole) {
      await context.initialMessage.channel.send(
        `Failed to add you to the \`Crew\` server role.`,
      )
    } else {
      context.guildMember?.roles
        .add(crewRole)
        .catch(() => {})
    }

    // add crew member
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
