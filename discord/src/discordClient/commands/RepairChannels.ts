import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import checkPermissions from '../actions/checkPermissions'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'

const command: CommandStub = {
  requiresShip: true,
  requiresCaptain: true,

  commandNames: [`repairchannels`],

  getDescription(): string {
    return `Attempt to repair the game's channels/roles (should they become unlinked)`
  },

  async run(context: InteractionContext) {
    if (!context.guild) return
    if (!context.ship) return

    // first, check to see if we have the necessary permissions to make channels
    const permissionsCheck = await checkPermissions({
      requiredPermissions: [`MANAGE_CHANNELS`, `MANAGE_ROLES`],
      channel:
        context.channel?.type === `GUILD_TEXT` ? context.channel : undefined,
      guild: context.guild,
    })
    if (`error` in permissionsCheck) {
      await context.reply(
        `I don't have permission to create channels/roles! Please add those permissions and rerun the command.`,
      )
      return
    }

    // roles
    const memberRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    // set roles appropriately
    try {
      if (memberRole && !(`error` in memberRole)) {
        ;(await context.guild.members.fetch()).forEach((gm) => {
          if ((context.ship?.crewMembers || []).find((cm) => cm.id === gm.id)) {
            // c.log(
            //   gm.nickname || gm.user.username,
            //   `is a crew member!`,
            // )
            if (!gm.roles.cache.find((r) => r === memberRole))
              gm.roles.add(memberRole).catch((e) => c.log(e))
          } else {
            // c.log(
            //   gm.nickname || gm.user.username,
            //   `ain't no crew member.`,
            // )
            if (gm.roles.cache.find((r) => r === memberRole))
              gm.roles.remove(memberRole).catch((e) => c.log(e))
          }
        })
      }
    } catch (e) {
      c.log(e)
    }

    // channels
    await resolveOrCreateChannel({
      type: `alert`,
      context,
    })
    await resolveOrCreateChannel({
      type: `chat`,
      context,
    })
    await resolveOrCreateChannel({
      type: `broadcast`,
      context,
    })

    await context.reply(`Channels repaired.`)
  },
}

export default command
