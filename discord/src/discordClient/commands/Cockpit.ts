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

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `cockpit`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }

    context.reply(
      `${context.nickname} moves to the cockpit.`,
    )
  }
}
