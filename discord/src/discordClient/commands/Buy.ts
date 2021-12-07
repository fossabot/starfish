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

    const charismaLevel =
      context.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc +
          (p.id === `boostCharisma` ? p.intensity || 0 : 0),
        0,
      ) +
      (context.crewMember.skills.find(
        (s) => s.skill === `charisma`,
      )?.level || 1)
    const getPrice = (
      cargoForSale: PlanetVendorCargoPrice,
    ) => {
      return c.getCargoBuyPrice(
        cargoForSale.id,
        planet,
        context.ship!.guildId,
        1,
        charismaLevel,
      )
    }

    const forSale = vendor.cargo
      .map((cargoForSale) => ({
        ...cargoForSale,
        price: getPrice(cargoForSale),
      }))
      .filter((cargoForSale) =>
        c.canAfford(
          cargoForSale.price,
          context.ship!,
          context.crewMember,
        ),
      )
    if (!forSale.length) {
      await context.reply(
        `You don't have enough to buy anything here.`,
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
            c.canAfford(
              p.price,
              context.ship!,
              context.crewMember,
            ) || 0,
            maxRemainingSpace,
          ),
          2,
          true,
        )} tons of ${c.capitalize(
          c.camelCaseToWords(p.id),
        )}:
${c.priceToString(p.price)}/ton`,
        style:
          (p.price.credits || 0) >
          (c.cargo[p.id].basePrice.credits || 0)
            ? `DANGER`
            : (p.price.credits || 0) <
              (c.cargo[p.id].basePrice.credits || 0)
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
              c.canAfford(
                forSaleEntry.price,
                context.ship!,
                context.crewMember,
              ) || 0,
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
            )} from ${planet.name} for ${c.priceToString(
              res.data.price,
            )}`,
          )
        else await context.reply(res.error)
      },
    })
  }
}
