import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class ChangeCaptainCommand implements Command {
  commandNames = [`changecaptain`, `captain`, `cc`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]} <@newcaptain>\` to change the ship's captain.`
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
        `No ship crew member found for that server member. Are you sure they've joined the crew?`,
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

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain (${
        commandContext.ship.crewMembers?.find(
          (cm) => cm.id === commandContext.ship?.captain,
        )?.name
      }) or a server admin can run this command.`
    return true
  }
}
