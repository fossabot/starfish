import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import { add } from '../../ioInterface/crew'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

export class JoinCommand implements Command {
  commandNames = [`join`, `add`, `j`]

  getHelpMessage(commandPrefix: string): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to join your server's ship.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.ship || !context.guild) return
    const addedCrewMember = await add(context.ship.id, {
      name: context.nickname,
      id: context.initialMessage.author.id,
    })
    // add crew member
    if (
      !addedCrewMember ||
      typeof addedCrewMember === `string`
    ) {
      await context.initialMessage.channel.send(
        addedCrewMember ||
          `Failed to add you as a member of the crew.`,
      )
      return
    }

    const crewRole = await resolveOrCreateRole({
      type: `crew`,
      guild: context.guild,
    })
    if (!crewRole) {
      await context.initialMessage.channel.send(
        `Failed to add you to the \`Crew\` server role.`,
      )
    } else {
      context.guildMember?.roles.add(crewRole)
    }

    if (context.ship.crewMembers?.length === 1)
      await context.sendToGuild(
        `Use this channel to chat with your crewmates.`,
        `chat`,
      )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    return true
  }
}
