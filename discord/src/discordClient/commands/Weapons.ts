import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'

const tacticChoices = [
  { name: `defensive`, value: `defensive` },
  { name: `aggressive`, value: `aggressive` },
  { name: `only non players`, value: `onlyNonPlayers` },
  { name: `only players`, value: `onlyPlayers` },
  { name: `pacifist`, value: `pacifist` },
]

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`weapons`],

  getDescription(): string {
    return `Move to the weapons bay. If you supply a tactic, you will adopt that tactic.`
  },

  args: [
    {
      type: `string`,
      prompt: `What tactic would you like to adopt?`,
      name: `tactic`,
      required: false,
      choices: tacticChoices,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    const res = await ioInterface.crew.move(
      context.ship.id,
      context.crewMember.id,
      `weapons`,
    )
    if (`error` in res) {
      context.reply(res.error)
      return
    }

    let tacticRes: string = ``
    if (context.args.tactic) {
      await ioInterface.crew.tactic(
        context.ship.id,
        context.crewMember.id,
        context.args.tactic as CombatTactic,
      )
      tacticRes = ` and adopts the \`${
        tacticChoices.find((t) => t.value === context.args.tactic)?.name
      }\` tactic`
    }

    context.reply(`${context.nickname} moves to the weapons bay${tacticRes}.`)
  },
}

export default command
