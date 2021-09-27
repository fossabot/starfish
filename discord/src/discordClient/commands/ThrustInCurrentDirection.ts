import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class ThrustInCurrentDirectionCommand
  implements Command
{
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`thrust`, `thrustincurrentdirection`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Use all of your current available thrust in the ship's current direction.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    const res =
      await ioInterface.crew.thrustInCurrentDirection(
        context.ship.id,
        context.crewMember.id,
      )

    if (`error` in res) context.reply(res.error)
    else
      context.reply(
        `${context.nickname} thrusted at ${c.r2(
          res.data,
          3,
        )}AU/hr in the current direction.`,
      )
  }
}
