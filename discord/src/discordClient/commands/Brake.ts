import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`brake`, `stop`],

  getDescription(): string {
    return `Apply the brakes with all of your current available charge.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    if (context.crewMember.bottomedOutOnStamina) {
      await context.reply(
        `${context.crewMember.name} is too tired to do anything.`,
      )
      return
    }

    // first, move to the cockpit
    const moveRes = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `cockpit`,
    )
    if (`error` in moveRes) {
      context.reply(moveRes.error)
      return
    }

    const hasPassiveEngines = context.ship.items?.find(
      (i) =>
        i.itemType === `engine` && (i as EngineStub).passiveThrustMultiplier,
    )
    const hasManualEngines = context.ship.items?.find(
      (i) =>
        i.itemType === `engine` && (i as EngineStub).manualThrustMultiplier,
    )

    if (!hasPassiveEngines && context.ship.speed === 0) {
      await context.reply(`${context.ship.name} is already stopped.`)
      return
    }

    if (hasManualEngines) {
      const engineThrustAmplification = Math.max(
        c.noEngineThrustMagnitude,
        (
          context.ship?.items?.filter(
            (e: ItemStub) => e.itemType === `engine` && (e.repair || 0) > 0,
          ) || []
        ).reduce(
          (total: number, e: EngineStub) =>
            total + (e.manualThrustMultiplier || 0) * (e.repair || 0),
          0,
        ) * (context.ship.gameSettings?.baseEngineThrustMultiplier || 1),
      )

      const pilotingSkill =
        context.crewMember.passives.reduce(
          (acc: number, p: CrewPassiveData) =>
            acc + (p.id === `boostDexterity` ? p.intensity || 0 : 0),
          0,
        ) +
        (context.crewMember.skills.find(
          (s: XPData) => s && s.skill === `dexterity`,
        )?.level || 1)

      const currentCockpitCharge = context.crewMember?.cockpitCharge || 0

      const maxPossibleSpeedChangeWithBrake =
        currentCockpitCharge *
        (c.getThrustMagnitudeForSingleCrewMember(
          pilotingSkill,
          engineThrustAmplification,
          context.ship.gameSettings?.baseEngineThrustMultiplier || 1,
        ) /
          (context.ship.mass || 10000)) *
        (context.ship.gameSettings?.brakeToThrustRatio || 1)

      const intentionallyOverBrakeMultiplier = 1 + Math.random() * 0.2

      const currentSpeed = context.ship.speed || 0
      const brakePercentNeeded = Math.min(
        1,
        (currentSpeed / maxPossibleSpeedChangeWithBrake) *
          intentionallyOverBrakeMultiplier,
      )

      const res = await ioInterface.crew.brake(
        context.ship.id,
        context.crewMember.id,
        brakePercentNeeded,
      )
      if (`error` in res) context.reply(res.error)
      else {
        await context.refreshShip()
        context.reply(
          `${context.nickname} manually braked${
            hasPassiveEngines ? ` and set their auto-nav to brake` : ``
          }, slowing the ship by ${c.speedNumber(
            res.data,
          )} to a speed of ${c.speedNumber(
            c.vectorToMagnitude(context.ship.velocity || [0, 0]) * 60 * 60,
          )}.`,
        )
      }
    }

    if (hasPassiveEngines) {
      const res = await ioInterface.crew.setTargetObjectOrLocation(
        context.ship.id,
        context.crewMember.id,
        context.ship,
      )

      if (`error` in res) context.reply(res.error)
      else if (!hasManualEngines) {
        context.reply(`${context.nickname} began braking passively.`)
      }
    }
  },
}

export default command
