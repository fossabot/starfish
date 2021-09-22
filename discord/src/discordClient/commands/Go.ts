import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class GoCommand implements Command {
  commandNames = [`go`, `room`, `move`, `moveto`]

  getHelpMessage(
    commandPrefix: string,
    availableRooms?: string[],
  ): string {
    return `Use \`${commandPrefix}${
      this.commandNames[0]
    } <room name>\` to move to a room in the ship.${
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
        `f`,
      ].includes(enteredString)
    )
      roomToGoTo = `cockpit`
    if (
      [`mine`, `mining`, `miner`, `dig`, `m`].includes(
        enteredString,
      )
    )
      roomToGoTo = `mine`
    if (
      [`repair`, `fix`, `repairs`, `r`].includes(
        enteredString,
      )
    )
      roomToGoTo = `repair`
    if (
      [
        `weapon`,
        `weapons`,
        `fight`,
        `combat`,
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

    ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      roomToGoTo,
    )
    context.reply(
      `${context.crewMember.name} moves to ${c.capitalize(
        roomToGoTo,
      )}.`,
    )
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    if (!commandContext.crewMember)
      return `Only crew members can run this command. Join the ship first!`
    return true
  }
}
