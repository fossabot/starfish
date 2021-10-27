import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

export class SellCommand implements Command {
  requiresShip = true
  requiresCrewMember = true
  requiresPlanet = true

  commandNames = [`sell`, `sellall`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <cargo type (optional)>\` - See planet sell options, and sell your cargo.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return

    const planet = context.ship.planet
    const vendor = planet.vendor
    if (!vendor) {
      await context.reply(
        `There is no vendor on this planet.`,
      )
      return
    }

    // let typeToSell: CargoId | undefined
    // if (context.args.length) {
    //   typeToSell = context.args[0]
    //     .replace(/[<>]/g, ``)
    //     .toLowerCase() as CargoId

    //   const foundCargo = context.crewMember.inventory.find(
    //     (i) => i.id === typeToSell,
    //   )
    //   if (!foundCargo || foundCargo.amount === 0) {
    //     await context.reply(
    //       `You don't have any ${typeToSell} to sell.`,
    //     )
    //     return
    //   }
    // }

    const typesToSell: CargoId[] = []
    // if (typeToSell) typesToSell.push(typeToSell)
    // else
    typesToSell.push(
      ...context.crewMember.inventory.map((i) => i.id),
    )

    const withPrices = context.crewMember.inventory
      .filter((i) => i.amount)
      .map((i) => {
        const price = c.getCargoSellPrice(
          i.id,
          planet,
          context.ship!.guildId,
        )

        return {
          id: i.id,
          amount: i.amount,
          price,
        }
      })

    if (withPrices.length === 0) {
      await context.reply(
        `You don't have any cargo that can be sold here.`,
      )
      return
    }

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `At ${planet.name}, ${context.crewMember.name} can sell:`,
      buttons: withPrices.map((p) => ({
        label: `${p.amount} ton${
          p.amount === 1 ? `` : `s`
        } of ${c.capitalize(c.camelCaseToWords(p.id))}:
${c.priceToString(p.price)}`,
        style:
          (p.price.credits || 0) <
          (c.cargo[p.id].basePrice.credits || 0)
            ? `DANGER`
            : (p.price.credits || 0) >
              (c.cargo[p.id].basePrice.credits || 0)
            ? `SUCCESS`
            : `SECONDARY`,
        customId: `sell` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        c.log(choice)
        const inv = context.crewMember!.inventory.find(
          (i) => `sell` + i.id === choice,
        )
        if (!inv) return
        const res = await ioInterface.crew.sell(
          context.ship!.id,
          context.crewMember!.id,
          inv.id,
          inv.amount,
          planet.id,
        )
        if (`data` in res)
          await context.reply(
            `${context.crewMember!.name} sold ${
              inv.amount
            } ton${
              inv.amount === 1 ? `` : `s`
            } of ${c.capitalize(
              c.camelCaseToWords(inv.id),
            )} to ${planet.name} for ${c.priceToString(
              res.data.price,
            )}`,
          )
        else await context.reply(res.error)
      },
    })
  }
}
