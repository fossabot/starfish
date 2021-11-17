import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

export class ThrustCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`target`, `t`, `thrust`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - See and set movement target options.`
  }

  async run(context: CommandContext) {
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

    const validTargets: {
      id: string
      location: CoordinatePair | false
      name: string
    }[] = []
    validTargets.push({
      ...context.ship,
      name: `Stop`,
    })
    validTargets.push({
      id: ``,
      location: false,
      name: `Crew Target Average`,
    })
    // if (context.ship.speed)
    //   validTargets.push({
    //     id: `current`,
    //     location: context.ship.location.map(
    //       (l, index) =>
    //         l +
    //         (context.ship!.velocity || [0, 0])[index] *
    //           1000,
    //     ) as CoordinatePair,
    //     name: `Current Trajectory`,
    //   })

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
          name: `🪐${planet.name}: ${c.speedNumber(
            c.distance(
              context.ship?.location,
              planet.location,
            ),
            true,
            0,
          )} km ${c.degreesToArrowEmoji(
            c.angleFromAToB(
              context.ship?.location,
              planet.location,
            ),
          )}`,
        })
      })

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `${context.crewMember.name} can target:`,
      // thrust with ${c.r2(
      //   context.crewMember.cockpitCharge * 100,
      //   0,
      // )}% of their capacity toward:`,
      buttons: validTargets.map((p) => ({
        label: `${p.name}`,
        style: `SECONDARY`,
        customId: `target` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        choice = choice.replace(`target`, ``)
        const target = validTargets.find(
          (t) => t.id === choice,
        )
        if (!target) return

        const res =
          await ioInterface.crew.setTargetObjectOrLocation(
            context.ship!.id,
            context.crewMember!.id,
            target,
          )

        if (`error` in res) await context.reply(res.error)
        else {
          await context.reply(
            `${context.nickname} ` +
              (target.id === context.ship?.id
                ? `began braking`
                : `set their thrust target ` +
                  (target.id === ``
                    ? `to the average of other crew members in the cockpit`
                    : `towards ` + target.name)) +
              `.`,
          )
          // await context.refreshShip()
          // await context.reply(
          //   `${context.nickname} thrusted ${c.speedNumber(
          //     res.data,
          //   )} ${
          //     target.id === `current`
          //       ? `along the ship's current trajectory`
          //       : `towards ` + target.name
          //   }. The ship's current speed is ${c.speedNumber(
          //     (context.ship?.speed || 0) * 60 * 60,
          //   )}.`,
          // )
        }
      },
    })
  }
}
