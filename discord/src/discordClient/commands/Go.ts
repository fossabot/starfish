import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import { CrewMember } from '../../../../game/src/game/classes/CrewMember/CrewMember'

export class GoCommand implements Command {
  commandNames = [`go`, `room`, `move`, `moveto`]

  getHelpMessage(commandPrefix: string, availableRooms?: string[]): string {
    return `Use \`${commandPrefix}${
      this.commandNames[0]
    } <room name>\` to move to a room in the ship.${
      availableRooms ? `\nAvailable rooms: ${availableRooms.join(`, `)}.` : ``
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

    let roomToGoTo = context.args[0].replace(/[<>]/g, ``) as CrewLocation
    if (!context.ship.rooms[roomToGoTo]) {
      context.reply(
        this.getHelpMessage(
          context.commandPrefix,
          Object.keys(context.ship.rooms),
        ),
      )
      return
    }

    ioInterface.crew.move(context.ship.id, context.crewMember.id, roomToGoTo)
    context.reply(`Moved ${CrewMember.name} to: ${roomToGoTo}.`)
  }

  hasPermissionToRun(commandContext: CommandContext): string | true {
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Use \`${commandContext.commandPrefix}start\` to start your server off in the game.`
    if (!commandContext.crewMember)
      return `Only crew members can run this command. Join the ship first!`
    return true
  }
}
