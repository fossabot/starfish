import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`lab`, `research`],

  getDescription(): string {
    return `Move to the lab.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    if (!context.ship.rooms.lab) {
      context.reply(`There's no lab on the ship!`)
      return
    }

    ioInterface.crew.move(context.ship.id, context.crewMember.id, `lab`)
    context.reply(
      `${context.nickname} moves to the lab and begins researching the first available task.`,
    )
  },
}

export default command
