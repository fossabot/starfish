import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class BrakeCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`brake`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Apply the brakes with all of your current available charge.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    if (context.crewMember.bottomedOutOnStamina) {
      await context.reply(
        `${context.crewMember.name} is too tired to do anything.`,
      )
      return
    }

    const engineThrustAmplification = Math.max(
      c.noEngineThrustMagnitude,
      (
        context.ship?.items?.filter(
          (e: ItemStub) =>
            e.type === `engine` && (e.repair || 0) > 0,
        ) || []
      ).reduce(
        (total: number, e: EngineStub) =>
          total +
          (e.thrustAmplification || 0) * (e.repair || 0),
        0,
      ) *
        (context.ship.gameSettings
          ?.baseEngineThrustMultiplier || 1),
    )
    const pilotingSkill =
      context.crewMember.skills.find(
        (s: XPData) => s && s.skill === `piloting`,
      )?.level || 1

    const currentCockpitCharge =
      context.crewMember?.cockpitCharge || 0

    const maxPossibleSpeedChangeWithBrake =
      currentCockpitCharge *
      (c.getThrustMagnitudeForSingleCrewMember(
        pilotingSkill,
        engineThrustAmplification,
        context.ship.gameSettings
          ?.baseEngineThrustMultiplier || 1,
      ) /
        (context.ship.mass || 10000)) *
      (context.ship.gameSettings?.brakeToThrustRatio || 1)

    const currentSpeed = context.ship.speed || 0
    const brakePercentNeeded = Math.min(
      1,
      currentSpeed / maxPossibleSpeedChangeWithBrake,
    )

    const intentionallyOverBrakeMultiplier = 1.2

    const res = await ioInterface.crew.brake(
      context.ship.id,
      context.crewMember.id,
      brakePercentNeeded,
    )

    if (`error` in res) context.reply(res.error)
    else {
      await context.refreshShip()
      context.reply(
        `${
          context.nickname
        } braked, slowing the ship by ${c.speedNumber(
          res.data,
        )} to a speed of ${c.speedNumber(
          (context.ship.speed || 0) * 60 * 60,
        )}.`,
      )
    }
  }
}
