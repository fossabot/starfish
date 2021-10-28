import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

export class ThrustCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`thrust`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - See thrust options and apply thrust to the ship.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    if (context.crewMember.bottomedOutOnStamina) {
      await context.reply(
        `${context.crewMember.name} is too tired to do anything.`,
      )
      return
    }

    const validTargets: {
      id: string
      location: CoordinatePair
      name: string
    }[] = []

    if (context.ship.speed)
      validTargets.push({
        id: `current`,
        location: context.ship.location.map(
          (l, index) =>
            l +
            (context.ship!.velocity || [0, 0])[index] *
              1000,
        ) as CoordinatePair,
        name: `Current Trajectory`,
      })

    context.ship.seenPlanets
      ?.sort(
        (a, b) =>
          c.distance(context.ship?.location, a.location) -
          c.distance(context.ship?.location, b.location),
      )
      .slice(0, 9)
      .forEach((planet) => {
        validTargets.push({
          ...planet,
          name: `🪐${planet.name}`,
        })
      })

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `${
        context.crewMember.name
      } can thrust with ${c.r2(
        context.crewMember.cockpitCharge * 100,
        0,
      )}% of their capacity toward:`,
      buttons: validTargets.map((p) => ({
        label: `${p.name}`,
        style: `SECONDARY`,
        customId: `thrustAt` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        choice = choice.replace(`thrustAt`, ``)
        const target = validTargets.find(
          (t) => t.id === choice,
        )
        if (!target) return

        const res = await ioInterface.crew.thrustAt(
          context.ship!.id,
          context.crewMember!.id,
          target.location,
        )

        if (`error` in res) await context.reply(res.error)
        else {
          await context.refreshShip()
          await context.reply(
            `${
              context.nickname
            } thrusted at ${c.speedNumber(res.data)} ${
              target.id === `current`
                ? `along the ship's current trajectory`
                : `towards ` + target.name
            }. The ship's current speed is ${c.speedNumber(
              (context.ship?.speed || 0) * 60 * 60,
            )}.`,
          )
        }
      },
    })
  }
}
