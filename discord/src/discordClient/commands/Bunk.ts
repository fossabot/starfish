import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`bunk`],

  getDescription(): string {
    return `Move to the bunk.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    ioInterface.crew.move(context.ship.id, context.crewMember.id, `bunk`)
    context.reply(`${context.nickname} moves to the bunk.`)
  },
}

export default command
