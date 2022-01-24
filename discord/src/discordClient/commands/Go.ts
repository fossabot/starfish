import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

import BunkCommand from './Bunk'
import CockpitCommand from './Cockpit'
import MineCommand from './Mine'
import RepairCommand from './Repair'
import WeaponsCommand from './Weapons'
import LabCommand from './Lab'

const locations: CrewLocation[] = [
  `bunk`,
  `cockpit`,
  `weapons`,
  `repair`,
  `mine`,
  `lab`,
  `lounge`,
]

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`go`, `moveto`],

  getDescription(rooms?: CrewLocation[]): string {
    if (!rooms) return `Move to a room in the ship.`
    return `Move to a room in the ship. Available rooms: ${c.printList(
      rooms.map((r) => c.capitalize(r)),
    )}`
  },

  args: [
    {
      name: `to`,
      type: `string`,
      prompt: `Where would you like to go?`,
      choices: locations.map((l) => ({
        name: c.capitalize(l),
        value: l,
      })),
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    let enteredString = context.args.to

    if ([`bunk`, `sleep`, `cabin`, `rest`, `b`].includes(enteredString))
      return BunkCommand.run(context)
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
      return CockpitCommand.run(context)
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
      return MineCommand.run(context)
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
      return RepairCommand.run(context)
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
      return WeaponsCommand.run(context)
    if (
      [`lab`, `l`, `laboratory`, `research`, `upgrade`].includes(enteredString)
    )
      return LabCommand.run(context)

    context.reply(this.getDescription(Object.keys(context.ship.rooms)))
  },
}

export default command
