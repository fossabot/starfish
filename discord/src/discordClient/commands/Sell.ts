import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForButtonChoiceWithCallback from '../actions/waitForButtonChoiceWithCallback'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,
  requiresPlanet: true,

  commandNames: [`sell`],

  getDescription(): string {
    return `See planet sell options, and sell your cargo.`
  },

  async run(context: InteractionContext) {
    if (!context.ship || !context.crewMember) return
    if (!context.ship.planet) return

    const planet = context.ship.planet
    const vendor = planet.vendor
    if (!vendor) {
      await context.reply(`There is no vendor on this planet.`)
      return
    }

    const typesToSell: CargoId[] = []
    typesToSell.push(...context.crewMember.inventory.map((i) => i.id))

    const charismaLevel =
      context.crewMember.passives.reduce(
        (acc: number, p: CrewPassiveData) =>
          acc + (p.id === `boostCharisma` ? p.intensity || 0 : 0),
        0,
      ) +
      (context.crewMember.skills.find((s) => s.skill === `charisma`)?.level ||
        1)

    const withPrices = context.crewMember.inventory
      .filter((i) => i.amount)
      .map((i) => {
        const price = c.getCargoSellPrice(
          i.id,
          planet,
          context.ship!.guildId,
          1,
          charismaLevel,
        )

        return {
          id: i.id,
          amount: i.amount,
          price,
        }
      })

    if (withPrices.length === 0) {
      await context.reply(`You don't have any cargo that can be sold here.`)
      return
    }

    waitForButtonChoiceWithCallback({
      allowedUserId: context.author.id,
      content: `At ${planet.name}, ${context.crewMember.name} can sell:`,
      buttons: withPrices.map((p) => ({
        label: `${c.r2(p.amount)} ton${
          p.amount === 1 ? `` : `s`
        } of ${c.capitalize(c.camelCaseToWords(p.id))}:
${c.priceToString(p.price)}/ton`,
        style:
          (p.price.credits || 0) < (c.cargo[p.id].basePrice.credits || 0)
            ? `DANGER`
            : (p.price.credits || 0) > (c.cargo[p.id].basePrice.credits || 0)
            ? `SUCCESS`
            : `SECONDARY`,
        customId: `sell` + p.id,
      })),
      context: context,
      callback: async (choice) => {
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
            `${context.crewMember!.name} sold ${c.r2(inv.amount)} ton${
              inv.amount === 1 ? `` : `s`
            } of ${c.capitalize(c.camelCaseToWords(inv.id))} to ${
              planet.name
            } for ${c.priceToString(res.data.price)}`,
          )
        else await context.reply(res.error)
      },
    })
  },
}

export default command
