import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCaptain: true,

  commandNames: [`changecaptain`, `setcaptain`],

  getDescription(): string {
    return `Change the ship's captain.`
  },

  args: [
    {
      type: `user`,
      prompt: `Who would you like to make the captain?`,
      name: `captain`,
      required: true,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship) return

    let newCaptain = context.args.captain
    if (!newCaptain) {
      await context.reply(`Please tag the new captain.`)
      return
    }

    const crewMember = context.ship.crewMembers?.find(
      (cm) => cm.id === newCaptain.id,
    )
    if (!crewMember) {
      await context.reply(
        `No ship crew member found for that server member. Are you sure they've \`/join\`ed the crew?`,
      )
      return
    }

    const res = await ioInterface.ship.setCaptain(
      context.ship.id,
      crewMember.id,
    )
    if (res) {
      await context.reply(res)
      return
    }

    await context.reply(
      `Captain changed to ${
        crewMember.speciesId ? c.species[crewMember.speciesId].icon : ``
      }${crewMember.name}.`,
    )
  },
}

export default command
