import resolveOrCreateRole from '../actions/resolveOrCreateRole'

import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,

  commandNames: [`join`],

  getDescription(): string {
    return `Join your server's ship.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.guild) return

    // add crew member
    const addedCrewMember = await ioInterface.crew.add(context.ship.id, {
      name: context.nickname,
      id: context.author.id,
    })

    // fail state
    if (!addedCrewMember || typeof addedCrewMember === `string`) {
      await context.reply(
        addedCrewMember || `Failed to add you as a member of the crew.`,
      )
      return
    }
    await context.reply(`Added you as a member of the crew.`)

    // create crew chat channel on second member
    if (context.ship.crewMembers?.length === 1)
      await context.sendToGuild(
        `Use this channel to chat with your crewmates.`,
        `chat`,
      )

    const gm = await context.getUserInGuildFromId(context.author.id)
    if (!gm) return
    const crewRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    if (!crewRole || `error` in crewRole) {
      await context.reply(`Failed to add you to the \`Crew\` server role.`)
    } else {
      gm.roles.add(crewRole).catch(() => {})
    }

    if (context.guildMember) {
      const guildMemberIcon = gm.user.avatarURL({
        size: 32,
      })
      ioInterface.crew.setDiscordIcon(
        context.ship.id,
        gm.user.id,
        guildMemberIcon || undefined,
      )
    }
  },
}

export default command
