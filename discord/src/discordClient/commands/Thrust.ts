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
    return `\`${commandPrefix}${this.commandNames[0]}\` - Use all of your current available thrust in the ship's current direction.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

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
      } can thrust with ${
        c.r2(context.crewMember.cockpitCharge) * 100
      }% of their capacity toward:`,
      buttons: validTargets.map((p) => ({
        label: `${p.name}`,
        style: `SECONDARY`,
        customId: `thrustAt` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        choice = choice.replace(`thrustAt`, ``)
        c.log(choice)
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
        else
          await context.reply(
            `${
              context.nickname
            } thrusted at ${c.speedNumber(res.data)} ${
              target.id === `current`
                ? `along the ship's current trajectory`
                : `towards ` + target.name
            }.`,
          )
      },
    })
  }
}
