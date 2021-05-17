import c from '../../../../common/dist'
import { CommandContext } from './models/CommandContext'
import type { Command } from './models/Command'
import { respawn } from '../../ioInterface/ship'

export class RespawnCommand implements Command {
  commandNames = [`r`, `respawn`]

  getHelpMessage(commandPrefix: string): string {
    this.commandNames = []
    return `Use ${commandPrefix}respawn to get your crew a new ship once you've died.`
  }

  async run({
    initialMessage,
  }: CommandContext): Promise<void> {
    // add ship
    const respawnedShip = await respawn(
      initialMessage.guild!.id,
    )
    if (!respawnedShip) {
      await initialMessage.channel.send(
        `Failed to respawn your server.`,
      )
      return
    }
    await initialMessage.channel.send(
      `Respawned your server!`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    if (!commandContext.ship.dead)
      return `Can't respawn because your ship isn't dead!`
    return true
  }
}
