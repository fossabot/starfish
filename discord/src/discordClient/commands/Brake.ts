import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class BrakeCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`brake`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Apply the brakes with all of your current available charge.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    if (context.crewMember.bottomedOutOnStamina) {
      await context.reply(
        `${context.crewMember.name} is too tired to do anything.`,
      )
      return
    }

    const res = await ioInterface.crew.brake(
      context.ship.id,
      context.crewMember.id,
    )

    if (`error` in res) context.reply(res.error)
    else
      context.reply(
        `${
          context.nickname
        } braked, slowing the ship by ${c.speedNumber(
          res.data * -1,
        )}.`,
      )
  }
}
