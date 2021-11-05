import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

export class ContributeToCommonFundCommand
  implements Command
{
  requiresShip = true
  requiresCrewMember = true

  commandNames = [
    `contribute`,
    `donate`,
    `commonfund`,
    `donatetocomonfund`,
  ]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Contribute ${c.baseCurrencyPlural} to the ship's common fund.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return

    const amounts: any[] = [
      1, 10, 100, 1000, 10000, 100000,
    ].filter((p) => p <= (context.crewMember?.credits || 0))
    if (!amounts.length) {
      await context.reply(
        `You don't have enough to contribute.`,
      )
      return
    }
    amounts.push(
      `Everything (${c.priceToString({
        credits: context.crewMember?.credits || 0,
      })})`,
    )

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `How much will ${context.crewMember.name} contribute to the ship's common fund?`,
      buttons: amounts.map((p) => ({
        label: `${
          typeof p === `number`
            ? c.priceToString({ credits: p })
            : p
        }`,
        style: `SECONDARY`,
        customId: `donate` + p,
      })),
      context: context,
      callback: async (choice) => {
        let amount = amounts.find(
          (p) => `donate` + p === choice,
        )
        if (!amount) return
        if (`${amount}`.startsWith(`Everything`))
          amount = context.crewMember?.credits || 0
        const res =
          await ioInterface.crew.contributeToCommonFund(
            context.ship!.id,
            context.crewMember!.id,
            amount,
          )
        if (`data` in res)
          await context.reply(
            `${
              context.crewMember!.name
            } contributed ${c.priceToString({
              credits: amount,
            })} to the ship's common fund, which now contains ${c.priceToString(
              { credits: res.data },
            )} credits.`,
          )
        else await context.reply(res.error)
      },
    })
  }
}
