import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,
  requiresPlanet: true,

  commandNames: [`mine`],

  getDescription(): string {
    return `Move to the mining bay.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return
    const planet = context.ship.planet
    if (!planet.mine) {
      context.reply(`This planet doesn't have a mine.`)
      return
    }
    const mine = context.ship.planet.mine!

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `mine`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }
    await context.reply(`${context.nickname} moves to the mining bay.`)

    const currentFocus =
      context.crewMember?.minePriority === `current`
        ? `current`
        : mine.find(
            (m) =>
              m.mineCurrent < m.mineRequirement &&
              m.id === context.crewMember?.minePriority,
          )?.id || `current`

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `${context.nickname} moves to the mining bay. They can mine:`,
      buttons: [
        ...mine.map((m) => (m.mineCurrent < m.mineRequirement ? m.id : null)),
        `closest`,
      ]
        .filter((m) => m)
        .map((p) => ({
          label:
            (p === `closest` ? `Closest to Done` : c.capitalize(p || ``)) +
            (p === currentFocus ? ` (current)` : ``),
          style: `SECONDARY`,
          customId: `mine` + p,
        })),
      context: context,
      callback: async (choice) => {
        const res = await ioInterface.crew.mineType(
          context.ship!.id,
          context.crewMember!.id,
          choice.replace(`mine`, ``) as MinePriorityType,
        )
        if (`data` in res) {
          const type =
            res.data === `closest` ? `the closest type to completion` : res.data
          await context.reply(
            `${context.nickname} moves to the mining bay and focuses their mining on ${type}.`,
          )
        } else await context.reply(res.error)
      },
    })
  },
}

export default command
