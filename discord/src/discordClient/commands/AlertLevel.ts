import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCaptain: true,

  commandNames: [`alertlevel`],

  getDescription(): string {
    return `Set the priority level for discord ship alerts.`
  },

  args: [
    {
      name: `level`,
      type: `string`,
      prompt: `What is your desired level for alerts to appear in the alert Discord channel?`,
      required: true,
      choices: [`off`, `low`, `medium`, `high`, `critical`],
    },
  ],

  async run(context: InteractionContext) {
    const newLevel = await ioInterface.ship.alertLevel(
      context.ship!.id,
      context.args.level,
    )
    if (newLevel.error) {
      context.reply(newLevel.error)
      return
    }
    if (newLevel.data === `off`) context.reply(`Alerts have been turned off.`)
    else
      context.reply(
        `You will receive alerts for anything of priority ${newLevel.data} and above.`,
      )
  },
}

export default command
