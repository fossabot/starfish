import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`changeshipname`, `renameship`],

  getDescription(): string {
    return `Change the ship's name.`
  },

  args: [
    {
      name: `name`,
      prompt: `The new name of the ship.`,
      required: true,
      type: `string`,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship) return

    let typedName = context.args.name
    typedName = typedName.replace(/(^[\s<]+|[>\s]+$)*/g, ``)

    ioInterface.ship.rename(context.ship.id, typedName)
    await context.reply(`Renamed the ship.`)
  },
}

export default command
