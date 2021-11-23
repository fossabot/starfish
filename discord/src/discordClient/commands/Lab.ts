import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class LabCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`lab`, `l`, `research`, `upgrade`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Move to the lab.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    if (!context.ship.rooms.lab) {
      context.reply(`There's no lab on the ship!`)
      return
    }

    ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `lab`,
    )
    context.reply(
      `${context.nickname} moves to the lab and begins researching.`,
    )
  }
}
