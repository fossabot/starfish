import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class RepairCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`repair`, `r`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <item type (optional)>\` - Move to the repair bay. If you supply an item type, you will focus repairs on that type.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    let targetType: RepairPriority | undefined
    if (context.args.length) {
      targetType = `most damaged`

      const enteredString = context.args[0]
        .replace(/[<>]/g, ``)
        .toLowerCase()
      if (
        [`weapons`, `weapon`, `w`].includes(enteredString)
      )
        targetType = `weapons`
      else if (
        [`armor`, `armors`, `a`].includes(enteredString)
      )
        targetType = `armor`
      else if (
        [`scanner`, `scan`, `scanners`, `s`].includes(
          enteredString,
        )
      )
        targetType = `scanners`
      else if (
        [
          `communicator`,
          `comms`,
          `comm`,
          `communicators`,
          `c`,
        ].includes(enteredString)
      )
        targetType = `communicators`
      else if (
        [`engine`, `eng`, `engines`, `e`].includes(
          enteredString,
        )
      )
        targetType = `engines`

      ioInterface.crew.repairType(
        context.ship.id,
        context.crewMember.id,
        targetType,
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
        (targetType
          ? `, and focuses their work on ${
              targetType === `most damaged`
                ? `the most damaged equipment`
                : targetType
            }`
          : ``) +
        `.`,
    )
  }
}
