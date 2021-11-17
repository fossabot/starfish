import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class CockpitCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [
    `cockpit`,
    `flight`,
    `flightdeck`,
    `fly`,
    `f`,
    `c`,
  ]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Move to the cockpit.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    const moveRes = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `cockpit`,
    )
    if (`error` in moveRes) {
      context.reply(moveRes.error)
      return
    }

    const targetRes =
      await ioInterface.crew.setTargetObjectOrLocation(
        context.ship!.id,
        context.crewMember!.id,
        false,
      )

    if (`error` in targetRes)
      await context.reply(targetRes.error)

    context.reply(
      `${context.nickname} moves to the cockpit, and targets their thrust to the average of other crew members there.`,
    )
  }
}
