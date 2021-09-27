import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class SellCommand implements Command {
  requiresShip = true
  requiresCrewMember = true
  requiresPlanet = true

  commandNames = [`sell`, `sellall`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <cargo type (optional)>\` - Sell all cargo to the current planet at that planet's going rate. If you provide a cargo type, will sell only that type.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return

    let typeToSell: CargoId | undefined
    if (context.args.length) {
      typeToSell = context.args[0]
        .replace(/[<>]/g, ``)
        .toLowerCase() as CargoId

      const foundCargo = context.crewMember.inventory.find(
        (i) => i.id === typeToSell,
      )
      if (!foundCargo || foundCargo.amount === 0) {
        await context.reply(
          `You don't have any ${typeToSell} to sell.`,
        )
        return
      }
    }

    const typesToSell: CargoId[] = []
    if (typeToSell) typesToSell.push(typeToSell)
    else
      typesToSell.push(
        ...context.crewMember.inventory.map((i) => i.id),
      )

    const sales: {
      cargoId: CargoId
      amount: number
      price: number
    }[] = []

    for (let t of typesToSell) {
      const amountHeld = context.crewMember.inventory.find(
        (i) => i.id === t,
      )?.amount
      if (!amountHeld) continue
      const res = await ioInterface.crew.sell(
        context.ship.id,
        context.crewMember.id,
        t,
        amountHeld,
        context.ship.planet!.name,
      )
      if (`data` in res) sales.push(res.data)
    }
    if (sales.length === 0) {
      await context.reply(
        `You don't have anything to sell.`,
      )
      return
    }
    c.log({ sales })

    context.reply(
      `${context.nickname} sells ${c.printList(
        sales.map(
          (s) =>
            `${c.r2(s.amount)} ton${
              s.amount === 1 ? `` : `s`
            } of ${c.camelCaseToWords(
              s.cargoId,
            )} for ${c.r2(s.price, 0)} credits`,
        ),
      )}.`,
    )
  }
}
