import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

export class BuyCommand implements Command {
  requiresShip = true
  requiresCrewMember = true
  requiresPlanet = true

  commandNames = [`buy`, `buyall`, `purchase`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - See cargo options at the current planet, and potentially buy some.`
  }

  async run(context: CommandContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return
    const planet = context.ship.planet
    const vendor = planet.vendor

    if (!vendor || (vendor && !vendor.cargo.length)) {
      await context.reply(
        `${context.ship.planet.name} doesn't sell any cargo.`,
      )
      return
    }

    const getPrice = (
      cargoForSale: PlanetVendorCargoPrice,
    ) => {
      return c.getCargoBuyPrice(
        cargoForSale.id,
        planet,
        context.ship!.guildId,
      )
    }

    const forSale = vendor.cargo
      .map((cargoForSale) => ({
        ...cargoForSale,
        price: getPrice(cargoForSale),
      }))
      .filter(
        (cargoForSale) =>
          cargoForSale.price * 0.1 <
          context.crewMember!.credits,
      )
    if (!forSale.length) {
      await context.reply(
        `You don't have enough credits to buy anything here.`,
      )
      return
    }

    const takenSpace = context.crewMember.inventory.reduce(
      (total, i) => total + i.amount,
      0,
    )
    const maxRemainingSpace =
      Math.min(
        context.ship!.chassis!.maxCargoSpace || 0,
        context.crewMember.maxCargoSpace,
      ) - takenSpace

    if (maxRemainingSpace < 0.01) {
      await context.reply(
        `You don't have enough inventory space to buy anything.`,
      )
      return
    }

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `At ${planet.name}, ${context.crewMember.name} can buy:`,
      buttons: forSale.map((p) => ({
        label: `${c.r2(
          Math.min(
            context.crewMember!.credits / p.price,
            maxRemainingSpace,
          ),
          2,
          true,
        )} tons of ${c.capitalize(
          c.camelCaseToWords(p.id),
        )}:
💳${p.price}/ton`,
        style:
          p.price > c.cargo[p.id].basePrice
            ? `DANGER`
            : p.price < c.cargo[p.id].basePrice
            ? `SUCCESS`
            : `SECONDARY`,
        customId: `buy` + p.id,
      })),
      context: context,
      callback: async (choice) => {
        const forSaleEntry = forSale.find(
          (cargoForSale) =>
            `buy` + cargoForSale.id === choice,
        )
        if (!forSaleEntry) return
        const amountToBuy = c.r2(
          Math.min(
            maxRemainingSpace,
            c.r2(
              context.crewMember!.credits /
                forSaleEntry.price,
              2,
              true,
            ),
          ),
          2,
          true,
        )
        const res = await ioInterface.crew.buy(
          context.ship!.id,
          context.crewMember!.id,
          forSaleEntry.id,
          amountToBuy,
          planet.id,
        )
        if (`data` in res)
          await context.reply(
            `${
              context.crewMember!.name
            } bought ${amountToBuy} ton${
              amountToBuy === 1 ? `` : `s`
            } of ${c.capitalize(
              c.camelCaseToWords(forSaleEntry.id),
            )} from ${planet.name} for 💳${c.r2(
              res.data.price,
              0,
            )}`,
          )
        else await context.reply(res.error)
      },
    })

    //   if (!cargoToBuy) {
    //     await context.reply(
    //       `${context.ship.planet.name} doesn't sell that.`,
    //     )
    //     return
    //   }

    //   const amountToBuy = c.r2(
    //     context.crewMember.credits / getPrice(cargoToBuy),
    //     2,
    //     true,
    //   )

    //   if (amountToBuy === 0) {
    //     await context.reply(
    //       `You don't have enough credits (💳${context.crewMember.credits}) for that.`,
    //     )
    //     return
    //   }

    //   const res = await ioInterface.crew.buy(
    //     context.ship.id,
    //     context.crewMember.id,
    //     cargoToBuy.id,
    //     amountToBuy,
    //     planet.name,
    //   )

    //   if (`error` in res) {
    //     await context.reply(res.error)
    //     return
    //   }

    //   context.reply(
    //     `${context.nickname} buys ${`${c.r2(
    //       res.data.amount,
    //     )} ton${
    //       res.data.amount === 1 ? `` : `s`
    //     } of ${c.camelCaseToWords(
    //       res.data.cargoId,
    //     )} for ${c.r2(res.data.price, 0)} credits`}.`,
    //   )
  }
}
