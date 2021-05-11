import c from '../../../../common/dist'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { io } from '../../ioInterface'
import { create } from '../../ioInterface/ship'
import { add } from '../../ioInterface/crew'

export class StartCommand implements Command {
  commandNames = ['start', 'spawn', 'begin', 'init']

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}start to start your server off in the game.`
  }

  async run({
    receivedDiscordMessage,
  }: CommandContext): Promise<void> {
    // add ship
    const createdShip = await create({
      id: receivedDiscordMessage.guild!.id,
      name: receivedDiscordMessage.guild!.name,
      planet: 'Origin',
      faction: 'green',
    })
    if (!createdShip) {
      await receivedDiscordMessage.channel.send(
        'Failed to start your server in the game.',
      )
      return
    }

    await receivedDiscordMessage.channel.send(
      'Started your server in the game.',
    )

    const addedCrewMember = await add(createdShip.id, {
      name: receivedDiscordMessage.author.username,
      id: receivedDiscordMessage.author.id,
    })
    // add crew member
    if (!addedCrewMember) {
      await receivedDiscordMessage.channel.send(
        'Failed to add you as a member of the crew.',
      )
      return
    }
    await receivedDiscordMessage.channel.send(
      'Added you to the crew.',
    )
  }

  hasPermissionToRun(
    parsedUserCommand: CommandContext,
  ): boolean {
    return true
  }
}
