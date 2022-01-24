import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`cockpit`, `flightdeck`],

  getDescription(): string {
    return `Move to the cockpit.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    const moveRes = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `cockpit`,
    )
    if (`error` in moveRes) {
      context.reply(moveRes.error)
      return
    }

    // passive engine users will auto-target to crew average
    const hasPassiveEngines = context.ship.items?.find(
      (i) =>
        i.itemType === `engine` && (i as EngineStub).passiveThrustMultiplier,
    )
    if (hasPassiveEngines && (context.ship.crewMembers?.length || 1) > 1) {
      const targetRes = await ioInterface.crew.setTargetObjectOrLocation(
        context.ship!.id,
        context.crewMember!.id,
        false,
      )

      if (`error` in targetRes) await context.reply(targetRes.error)

      context.reply(
        `${context.nickname} moves to the cockpit, and targets their thrust to the average of other crew members there.`,
      )
    } else {
      context.reply(`${context.nickname} moves to the cockpit.`)
    }
  },
}

export default command
