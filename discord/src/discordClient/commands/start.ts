import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface/'

export class StartCommand implements Command {
  commandNames = [`s`, `start`, `spawn`, `begin`, `init`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}start to start your server off in the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.initialMessage.guild) return

    // add ship
    const createdShip = await ioInterface.ship.create({
      id: context.initialMessage.guild.id,
      name: context.initialMessage.guild.name,
      species: { id: `angelfish` },
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
        name: context.initialMessage.author.username,
        id: context.initialMessage.author.id,
      },
    )
    // add crew member
    if (!addedCrewMember) {
      await context.initialMessage.channel.send(
        `Failed to add you as a member of the crew.`,
      )
      return
    }

    await context.sendToGuild(
      `Welcome to the game! Game alerts will be sent to this channel.`,
    )
    await context.sendToGuild(
      `${context.initialMessage.author.username} has joined the crew.`,
    )
    await context.sendToGuild(
      `Use this channel to chat with your crewmates.`,
      `chat`,
    )
    await context.sendToGuild(
      `Use this channel to broadcast to the local area.`,
      `broadcast`,
    )
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
