import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class WeaponsCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`weapons`, `weapon`, `w`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Move to the weapons bay.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `weapons`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }

    context.reply(
      `${context.nickname} moves to the weapons bay.`,
    )
  }
}
