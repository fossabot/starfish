import c from '../../../../common/dist'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { add } from '../../ioInterface/crew'

export class JoinCommand implements Command {
  commandNames = [`j`, `join`, `add`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}join to join your server's ship.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return
    const addedCrewMember = await add(context.ship.id, {
      name: context.initialMessage.author.username,
      id: context.initialMessage.author.id,
    })
    // add crew member
    if (
      !addedCrewMember ||
      typeof addedCrewMember === `string`
    ) {
      await context.initialMessage.channel.send(
        addedCrewMember ||
          `Failed to add you as a member of the crew.`,
      )
      return
    }
    await context.initialMessage.channel.send(
      `Added you to the crew.`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    return true
  }
}
