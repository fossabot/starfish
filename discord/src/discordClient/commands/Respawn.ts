import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { respawn } from '../../ioInterface/ship'

export class RespawnCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`respawn`, `rs`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Get your crew a new ship once you've died.`
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
    if (commandContext.ship && !commandContext.ship.dead)
      return `Can't respawn because your ship isn't dead!`
    return true
  }
}
