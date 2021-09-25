import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { respawn } from '../../ioInterface/ship'

export class RespawnCommand implements Command {
  commandNames = [`respawn`, `r`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to get your crew a new ship once you've died.`
  }

  async run(context: CommandContext): Promise<void> {
    // add ship
    const respawnedShip = await respawn(context.guild!.id)
    if (!respawnedShip) {
      await context.reply(
        `Failed to respawn ${
          context.ship?.name || `your server`
        }.`,
      )
      return
    }
    await context.reply(
      `Respawned ${context.ship?.name || `your server`}!`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain (${
        commandContext.ship.crewMembers?.find(
          (cm) => cm.id === commandContext.ship?.captain,
        )?.name
      }) or a server admin can run this command.`
    if (!commandContext.ship.dead)
      return `Can't respawn because your ship isn't dead!`
    return true
  }
}
