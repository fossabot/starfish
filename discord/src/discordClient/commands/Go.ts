import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class GoCommand implements Command {
  requiresShip = true
  requiresCrewMember = true

  commandNames = [`go`, `room`, `move`, `moveto`]

  getHelpMessage(
    commandPrefix: string,
    availableRooms?: string[],
  ): string {
    return `\`${commandPrefix}${
      this.commandNames[0]
    } <room name>\` - Move to a room in the ship.${
      availableRooms
        ? `\nAvailable rooms: ${availableRooms.join(`, `)}.`
        : ``
    }`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.args.length) {
      context.reply(
        this.getHelpMessage(
          context.commandPrefix,
          Object.keys(context.ship.rooms),
        ),
      )
      return
    }

    let enteredString = context.args[0]
      .replace(/[<>]/g, ``)
      .toLowerCase()

    let roomToGoTo: CrewLocation | undefined
    if (
      [`bunk`, `sleep`, `cabin`, `rest`, `b`].includes(
        enteredString,
      )
    )
      roomToGoTo = `bunk`
    if (
      [
        `cockpit`,
        `fly`,
        `flight`,
        `flight deck`,
        `flight bay`,
        `f`,
        `c`,
      ].includes(enteredString)
    )
      roomToGoTo = `cockpit`
    if (
      [
        `mine`,
        `mining bay`,
        `mine bay`,
        `mining`,
        `miner`,
        `dig`,
        `m`,
      ].includes(enteredString)
    )
      roomToGoTo = `mine`
    if (
      [
        `repair`,
        `repairs bay`,
        `repair bay`,
        `fix`,
        `repairs`,
        `r`,
        `rep`,
      ].includes(enteredString)
    )
      roomToGoTo = `repair`
    if (
      [
        `weapon`,
        `weapons`,
        `weapons bay`,
        `weapon bay`,
        `fight`,
        `combat`,
        `kill`,
        `attack`,
        `w`,
      ].includes(enteredString)
    )
      roomToGoTo = `weapons`

    if (!roomToGoTo || !context.ship.rooms[roomToGoTo]) {
      context.reply(
        this.getHelpMessage(
          context.commandPrefix,
          Object.keys(context.ship.rooms),
        ),
      )
      return
    }

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      roomToGoTo,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }
    context.reply(
      `${context.nickname} moves to ${c.capitalize(
        roomToGoTo,
      )}.`,
    )
  }
}
