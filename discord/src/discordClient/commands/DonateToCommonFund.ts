import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`contribute`, `donate`],

  getDescription(): string {
    return `Contribute ${c.baseCurrencyPlural} to the ship's common fund.`
  },

  args: [
    {
      type: `number`,
      required: true,
      name: `amount`,
      prompt: `How many ${c.baseCurrencyPlural}?`,
    },
  ],

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return

    let enteredAmount = context.args.amount

    if (enteredAmount <= 0) {
      await context.reply(`You can't contribute that amount.`)
      return
    }

    if (context.crewMember?.credits <= 0) {
      await context.reply(`You don't have any credits to contribute.`)
      return
    }

    if (context.crewMember?.credits < enteredAmount) {
      enteredAmount = context.crewMember?.credits
    }

    const res = await ioInterface.crew.contributeToCommonFund(
      context.ship!.id,
      context.crewMember!.id,
      enteredAmount,
    )
    if (`data` in res)
      await context.reply(
        `${context.crewMember!.name} contributed ${c.priceToString({
          credits: enteredAmount,
        })} to the ship's common fund, which now contains ${c.priceToString({
          credits: res.data,
        })} credits.`,
      )
    else await context.reply(res.error)
  },
}

export default command
