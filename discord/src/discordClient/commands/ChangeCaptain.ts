import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class ChangeCaptainCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [
    `changecaptain`,
    `setcaptain`,
    `captain`,
    `cc`,
  ]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <@newcaptain>\` - Change the ship's captain.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return

    let typedId = context.args[0]
    if (!typedId) {
      await context.reply(
        `Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <@newcaptain>\`.`,
      )
      return
    }
    typedId = typedId.replace(/[<>@!]*/g, ``)

    const crewMember = context.ship.crewMembers?.find(
      (cm) => cm.id === typedId,
    )
    if (!crewMember) {
      await context.reply(
        `No ship crew member found for that server member. Are you sure they've \`${context.commandPrefix}join\`ed the crew?`,
      )
      return
    }

    const res = await ioInterface.ship.setCaptain(
      context.ship.id,
      crewMember.id,
    )
    if (res) {
      await context.reply(res)
    }
  }
}
