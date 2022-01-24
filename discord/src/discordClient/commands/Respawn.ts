import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import { respawn } from '../../ioInterface/ship'

const command: CommandStub = {
  requiresShip: true,
  requiresCaptain: true,

  commandNames: [`respawn`],

  getDescription(): string {
    return `Get your crew a new ship once you've died.`
  },

  async run(context: InteractionContext) {
    if (context.ship && !context.ship.dead) {
      await context.reply(`Can't respawn because your ship isn't dead!`)
      return
    }

    // add ship
    const respawnedShip = await respawn(context.guild!.id)
    if (!respawnedShip) {
      await context.reply(
        `Failed to respawn ${context.ship?.name || `your server`}.`,
      )
      return
    }
    await context.reply(`Respawned ${context.ship?.name || `your server`}!`)
  },
}

export default command
