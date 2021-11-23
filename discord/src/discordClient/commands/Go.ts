import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import { BunkCommand } from './Bunk'
import { CockpitCommand } from './Cockpit'
import { MineCommand } from './Mine'
import { RepairCommand } from './Repair'
import { WeaponsCommand } from './Weapons'
import { LabCommand } from './Lab'

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

    if (
      [`bunk`, `sleep`, `cabin`, `rest`, `b`].includes(
        enteredString,
      )
    )
      return new BunkCommand().run(context)
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
      return new CockpitCommand().run(context)
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
      return new MineCommand().run(context)
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
      return new RepairCommand().run(context)
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
      return new WeaponsCommand().run(context)
    if (
      [
        `lab`,
        `l`,
        `laboratory`,
        `research`,
        `upgrade`,
      ].includes(enteredString)
    )
      return new LabCommand().run(context)

    context.reply(
      this.getHelpMessage(
        context.commandPrefix,
        Object.keys(context.ship.rooms),
      ),
    )
  }
}
