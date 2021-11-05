import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

export class KickMemberCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`kickmember`, `kick`, `km`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <@member_to_kick>\` - Kick a crew member. This action is permanent.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship) return

    let typedId = context.args[0]
    if (!typedId) {
      await context.reply(
        `Use this command in the format \`${context.commandPrefix}${this.commandNames[0]} <@member_to_kick>\`.`,
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

    const res = await ioInterface.ship.kickMember(
      context.ship.id,
      crewMember.id,
    )
    if (res) {
      await context.reply(res)
    }

    // remove role
    const memberRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    try {
      if (memberRole && !(`error` in memberRole)) {
        if (
          context.guildMember?.roles.cache.find(
            (r) => r === memberRole,
          )
        )
          context.guildMember?.roles
            .remove(memberRole)
            .catch((e) => c.log(e))
      }
    } catch (e) {
      c.log(e)
    }
  }
}
