import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class KickMemberCommand implements Command {
  commandNames = [`kickmember`, `kick`, `km`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]} <@member_to_kick>\` to kick a crew member. This action is permanent.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return

    let typedId = context.args[0]
    if (!typedId) {
      await context.initialMessage.channel.send(
        `Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <@member_to_kick>\`.`,
      )
      return
    }
    typedId = typedId.replace(/[<>@!]*/g, ``)

    const crewMember = context.ship.crewMembers?.find(
      (cm) => cm.id === typedId,
    )
    if (!crewMember) {
      await context.initialMessage.channel.send(
        `No ship crew member found for that server member. Are you sure they've joined the crew?`,
      )
      return
    }

    const res = await ioInterface.ship.kickMember(
      context.ship.id,
      crewMember.id,
    )
    if (res) {
      await context.initialMessage.channel.send(res)
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
