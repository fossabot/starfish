import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class BunkCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`bunk`, `b`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Move to the bunk.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `bunk`,
    )
    context.reply(`${context.nickname} moves to the bunk.`)
  }
}
