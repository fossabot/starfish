import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

const command: CommandStub = {
  requiresShip: true,
  requiresCaptain: true,

  commandNames: [`kickmember`],

  getDescription(): string {
    return `Kick a crew member from the ship. This action is permanent.`
  },

  args: [
    {
      type: `string`,
      prompt: `Who would you like to kick from the ship? (discord id or in-game name)`,
      name: `member`,
      required: true,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship) return

    let typedId = context.args.member.replace(/[@<>]*/g, ``).toLowerCase()

    const crewMembers = context.ship.crewMembers?.filter(
      (cm) => cm.id === typedId || cm.name.toLowerCase() === typedId,
    )
    if (!crewMembers?.length) {
      await context.reply(
        `No ship crew member found for that server member. Are you sure they've joined the crew?`,
      )
      return
    }
    if (crewMembers.length > 1) {
      await context.reply(
        `Multiple ship crew members found for that server member. Please use their ID instead.`,
      )
      return
    }
    const crewMember = crewMembers[0]

    const res = await ioInterface.ship.kickMember(
      context.ship.id,
      crewMember.id,
    )
    if (res) {
      await context.reply(res)
    } else
      await context.reply(`Crew member ${typedId} was kicked from the ship.`)

    // remove role
    const gm = await context.getUserInGuildFromId(context.author.id)
    if (!gm) return
    const memberRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    try {
      if (memberRole && !(`error` in memberRole)) {
        if (gm.roles.cache.find((r) => r === memberRole))
          gm.roles.remove(memberRole).catch((e) => c.log(e))
      }
    } catch (e) {
      c.log(e)
    }
  },
}

export default command
