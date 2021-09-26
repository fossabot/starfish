import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class BrakeCommand implements Command {
  commandNames = [`brake`]

  getHelpMessage(
    commandPrefix: string,
    availableRooms?: string[],
  ): string {
    return `Use \`${commandPrefix}${this.commandNames[0]}\` to apply the brakes with all of your current available charge.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    const res = await ioInterface.crew.brake(
      context.ship.id,
      context.crewMember.id,
    )

    if (`error` in res) context.reply(res.error)
    else
      context.reply(
        `${
          context.nickname
        } braked, slowing the ship by ${c.r2(
          res.data * -1,
          3,
        )}AU/hr.`,
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
