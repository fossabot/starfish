import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class AlertLevelCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`alertlevel`, `al`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <1, 2, 3, 4, or 5>\` - Set the severity of alerts that will appear in the \`alerts\` channel.`
  }

  async run(context: CommandContext) {
    if (!context.ship) return
    if (!context.args.length) {
      context.reply(
        this.getHelpMessage(context.commandPrefix),
      )
      return
    }

    let selectedNumber = parseInt(
      context.args[0].replace(/[<>]/g, ``),
    )
    if (isNaN(selectedNumber)) selectedNumber = 4
    selectedNumber--

    const selectedLevel: LogLevel | undefined = (
      [
        `low`,
        `medium`,
        `high`,
        `critical`,
        `off`,
      ] as LogLevel[]
    )[selectedNumber]
    if (!selectedLevel) return

    const newLevel = await ioInterface.ship.alertLevel(
      context.ship.id,
      selectedLevel,
    )
    if (newLevel.error) return
    if (newLevel.data === `off`)
      context.sendToGuild(`Alerts have been turned off.`)
    else
      context.sendToGuild(
        `You will receive alerts for anything of priority ${newLevel.data} and above.`,
      )
  }
}
