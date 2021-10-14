import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class MineCommand implements Command {
  requiresShip = true
  requiresCrewMember = true
  requiresPlanet = true

  commandNames = [`mine`, `m`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <cargo type (optional)>\` - Move to the mining bay. If you supply a cargo type (or 'closest'), you will focus mining on that type.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return
    const planet = context.ship.planet
    if (!planet.mine) {
      context.reply(`This planet doesn't have a mine.`)
      return
    }

    let changedType: MinePriorityType | undefined
    if (context.args.length) {
      const enteredString = context.args[0]
        .replace(/[<>'"]/g, ``)
        .toLowerCase() as MinePriorityType

      if (
        enteredString !== `closest` &&
        !planet.mine.find(
          (m: PlanetMineEntry) => m.id === enteredString,
        )
      ) {
        context.reply(
          `Invalid cargo type. Valid types are: ${c.printList(
            [
              `closest`,
              ...planet.mine.map(
                (m: PlanetMineEntry) => m.id,
              ),
            ],
          )}.`,
        )
        return
      }

      const res = await ioInterface.crew.mineType(
        context.ship.id,
        context.crewMember.id,
        enteredString,
      )
      if (`error` in res) {
        await context.reply(res.error)
        return
      }
      changedType = res.data
    }

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `mine`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }

    await context.reply(
      `${context.nickname} moves to the mining bay` +
        (changedType
          ? ` and focuses on mining ${
              changedType === `closest`
                ? `the type closest to completion`
                : changedType
            }`
          : ``) +
        `.`,
    )
  }
}
