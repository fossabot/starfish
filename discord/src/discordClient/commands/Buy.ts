import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

export class BuyCommand implements Command {
  requiresShip = true
  requiresCrewMember = true
  requiresPlanet = true

  commandNames = [`buy`, `buyall`, `purchase`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]} <cargo type (optional)>\` - Buy as much <cargo type> as possible at your current planet's going rate.`
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
      return Math.ceil(
        c.cargo[cargoForSale.id].basePrice *
          cargoForSale.buyMultiplier *
          planet.priceFluctuator *
          ((planet.allegiances.find(
            (a) =>
              a.faction.id === context.ship!.faction.id,
          )?.level || 0) >= c.factionAllegianceFriendCutoff
            ? c.factionVendorMultiplier
            : 1),
      )
    }

    let typeToBuy: CargoId | undefined
    if (context.args.length === 0) {
      await context.reply(
        `Available cargo at ${planet.name}:
${c.printList(
  vendor.cargo.map(
    (ca) =>
      `${c.capitalize(
        c.camelCaseToWords(ca.id),
      )} for 💳 ${getPrice(ca)}/ton`,
  ),
)}`,
      )
      return
    }

    const cargoToBuy = vendor.cargo.find(
      (ca) =>
        ca.id.toLowerCase().replace(/\s/g, ``) ===
        context.args[0]
          .replace(/[<>\s]/g, ``)
          .toLowerCase(),
    )
    if (!cargoToBuy) {
      await context.reply(
        `${context.ship.planet.name} doesn't sell that.`,
      )
      return
    }

    const amountToBuy = c.r2(
      context.crewMember.credits / getPrice(cargoToBuy),
      2,
      true,
    )

    if (amountToBuy === 0) {
      await context.reply(
        `You don't have enough credits (${context.crewMember.credits}) for that.`,
      )
      return
    }

    const res = await ioInterface.crew.buy(
      context.ship.id,
      context.crewMember.id,
      cargoToBuy.id,
      amountToBuy,
      planet.name,
    )

    if (`error` in res) {
      await context.reply(res.error)
      return
    }

    context.reply(
      `${context.nickname} buys ${`${c.r2(
        res.data.amount,
      )} ton${
        res.data.amount === 1 ? `` : `s`
      } of ${c.camelCaseToWords(
        res.data.cargoId,
      )} for ${c.r2(res.data.price, 0)} credits`}.`,
    )
  }
}
