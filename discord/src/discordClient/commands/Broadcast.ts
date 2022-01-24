import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`broadcast`],

  getDescription(): string {
    return `Broadcast a message within the ship's communications range.`
  },

  args: [
    {
      name: `text`,
      type: `string`,
      prompt: `What message would you like to broadcast?`,
      required: true,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship) return
    const res = await ioInterface.ship.broadcast(
      context.ship.id,
      context.author.id,
      context.args.text,
    )
    if (res.error) context.reply(res.error)
    if (res.data !== undefined)
      context.reply(
        `${context.nickname} sends:
\`\`\`${context.args.text}\`\`\`
The broadcast was received by **${res.data}** ship${
          res.data === 1 ? `` : `s`
        }.`,
      )
  },
}

export default command
