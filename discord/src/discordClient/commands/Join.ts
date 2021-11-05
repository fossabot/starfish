import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { add } from '../../ioInterface/crew'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

export class JoinCommand implements Command {
  requiresShip = true

  commandNames = [`join`, `add`, `j`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Join your server's ship.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship || !context.guild) return

    // add crew member
    const addedCrewMember = await add(context.ship.id, {
      name: context.nickname,
      id: context.initialMessage.author.id,
    })

    // fail state
    if (
      !addedCrewMember ||
      typeof addedCrewMember === `string`
    ) {
      await context.reply(
        addedCrewMember ||
          `Failed to add you as a member of the crew.`,
      )
      return
    }

    // create crew chat channel on second member
    if (context.ship.crewMembers?.length === 1)
      await context.sendToGuild(
        `Use this channel to chat with your crewmates.`,
        `chat`,
      )

    const crewRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    if (!crewRole || `error` in crewRole) {
      await context.reply(
        `Failed to add you to the \`Crew\` server role.`,
      )
    } else {
      context.guildMember?.roles
        .add(crewRole)
        .catch(() => {})
    }
  }
}
