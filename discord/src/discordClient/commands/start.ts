import c from '../../../../common/dist'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { create } from '../../ioInterface/ship'
import { add } from '../../ioInterface/crew'

export class StartCommand implements Command {
  commandNames = [`start`, `spawn`, `begin`, `init`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}start to start your server off in the game.`
  }

  async run({
    initialMessage,
  }: CommandContext): Promise<void> {
    // add ship
    const createdShip = await create({
      id: initialMessage.guild!.id,
      name: initialMessage.guild!.name,
      planet: `Origin`,
      faction: `green`,
    })
    if (!createdShip) {
      await initialMessage.channel.send(
        `Failed to start your server in the game.`,
      )
      return
    }

    await initialMessage.channel.send(
      `Started your server in the game.`,
    )

    const addedCrewMember = await add(createdShip.id, {
      name: initialMessage.author.username,
      id: initialMessage.author.id,
    })
    // add crew member
    if (!addedCrewMember) {
      await initialMessage.channel.send(
        `Failed to add you as a member of the crew.`,
      )
      return
    }
    await initialMessage.channel.send(
      `Added you to the crew.`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.ship)
      return `Your server already has a ship! It's called ${commandContext.ship.name}.`
    return true
  }
}
