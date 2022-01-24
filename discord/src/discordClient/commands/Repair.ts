import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`repair`],

  getDescription(): string {
    return `Move to the repair bay. If you supply an item type, you will focus repairs on that type.`
  },

  args: [
    {
      name: `type`,
      type: `string`,
      prompt: `What type of item would you like to repair?`,
      choices: [
        `most damaged`,
        `engines`,
        `weapons`,
        `armor`,
        `communicators`,
        `scanners`,
      ],
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    if (context.args.type) {
      ioInterface.crew.repairType(
        context.ship.id,
        context.crewMember.id,
        context.args.type,
      )
    }

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `repair`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }

    context.reply(
      `${context.nickname} moves to the repair bay` +
        (context.args.type
          ? ` and focuses their work on ${
              context.args.type === `most damaged`
                ? `the most damaged equipment`
                : context.args.type
            }`
          : ``) +
        `.`,
    )
  },
}

export default command
