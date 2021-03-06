import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'
import BrakeCommand from './Brake'

import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`thrust`],

  getDescription(): string {
    return `Apply thrust and set movement target options.`
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

    const validTargets: {
      id: string
      location: CoordinatePair | false
      name: string
    }[] = []
    validTargets.push({
      ...context.ship,
      name: `Brake`,
    })
    if (hasPassiveEngines && (context.ship.crewMembers?.length || 1) > 1)
      validTargets.push({
        id: ``,
        location: false,
        name: `Crew Target Average`,
      })
    if (hasManualEngines && !hasPassiveEngines && context.ship.speed)
      validTargets.push({
        id: `current`,
        location: context.ship.location.map(
          (l, index) => l + (context.ship!.velocity || [0, 0])[index] * 1000,
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
          name: `????${planet.name}: ${c.speedNumber(
            c.distance(context.ship?.location, planet.location),
            true,
            0,
          )} km ${c.degreesToArrowEmoji(
            c.angleFromAToB(context.ship?.location, planet.location),
          )}`,
        })
      })

    let label
    if (hasManualEngines && !hasPassiveEngines)
      label = `${context.crewMember.name} can thrust with ${c.r2(
        context.crewMember.cockpitCharge * 100,
        0,
      )}% of their capacity toward:`
    else if (hasManualEngines && hasPassiveEngines)
      label = `${context.crewMember.name} can thrust with ${c.r2(
        context.crewMember.cockpitCharge * 100,
        0,
      )}% of their capacity, as well as target their auto-nav toward:`
    else if (hasPassiveEngines)
      label = `${context.crewMember.name} can target their auto-nav toward:`
    else label = hasManualEngines + ` ` + hasPassiveEngines

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: label,
      buttons: validTargets.map((p) => ({
        label: `${p.name}`,
        style: `SECONDARY`,
        customId: `target` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        choice = choice.replace(`target`, ``)
        const target = validTargets.find((t) => t.id === choice)
        if (!target) return

        // 'Brake' just runs Brake comand
        if (target.name === `Brake`) return BrakeCommand.run(context)

        // manual engines
        if (hasManualEngines && target?.location) {
          const res = await ioInterface.crew.thrustAt(
            context.ship!.id,
            context.crewMember!.id,
            target.location,
          )
          if (`error` in res) await context.reply(res.error)
          else {
            await context.refreshShip()
            await context.reply(
              `${context.nickname} ${
                hasPassiveEngines ? `targeted their auto-nav and manually ` : ``
              }thrusted ${c.speedNumber(res.data)} ${
                target.id === `current`
                  ? `along the ship's current trajectory`
                  : `towards ` + target.name
              }. The ship's current speed is ${c.speedNumber(
                (context.ship?.speed || 0) * 60 * 60,
              )}.`,
            )
          }
        }

        // passive engines
        if (hasPassiveEngines) {
          const passiveRes = await ioInterface.crew.setTargetObjectOrLocation(
            context.ship!.id,
            context.crewMember!.id,
            target,
          )

          if (`error` in passiveRes) await context.reply(passiveRes.error)
          else if (!hasManualEngines || !target?.location) {
            await context.reply(
              `${context.nickname} set their thrust target ` +
                (target.id === ``
                  ? `to the average of other crew members in the cockpit`
                  : `towards ` + target.name) +
                `.`,
            )
          }
        }
      },
    })
  },
}

export default command
