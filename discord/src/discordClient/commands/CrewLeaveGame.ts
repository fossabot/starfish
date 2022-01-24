import c from '../../../../common/dist'
import type { InteractionContext } from '../models/getInteractionContext'
import type { CommandStub } from '../models/Command'
import ioInterface from '../../ioInterface'
import waitForSingleButtonChoice from '../actions/waitForSingleButtonChoice'
import { MessageEmbed } from 'discord.js'
import ShipLeaveGameCommand from './ShipLeaveGame'
import resolveOrCreateRole from '../actions/resolveOrCreateRole'

const command: CommandStub = {
  requiresShip: true,
  requiresCrewMember: true,

  commandNames: [`leave`],

  getDescription(): string {
    return `Your crew member leaves the ship. This action is permanent.`
  },

  async run(context: InteractionContext) {
    if (!context.ship) return
    if (!context.crewMember) return

    if (context.ship.crewMembers?.length === 1) {
      context.reply({
        embeds: [
          new MessageEmbed({
            color: `RED`,
            title: `You're the only crew member left!`,
            description: `Use \`/${ShipLeaveGameCommand.commandNames[0]}\` instead to remove your ship fully from the game.`,
          }),
        ],
      })
      return
    }

    const { result: deleteChannelsConfirmResult, sentMessage: pm } =
      await waitForSingleButtonChoice({
        context,
        content: [
          new MessageEmbed({
            color: `RED`,
            title: `Wait, really?`,
            description: `This will **permanently** delete your crew member from the ship.

Is that okay with you?`,
          }),
        ],
        allowedUserId: context.author.id,
        buttons: [
          {
            label: `Leave Game`,
            style: `DANGER`,
            customId: `leaveGameYes`,
          },
          {
            label: `Don't Leave Game`,
            style: `SECONDARY`,
            customId: `leaveGameNo`,
          },
        ],
      })

    if (
      !deleteChannelsConfirmResult ||
      deleteChannelsConfirmResult === `leaveGameNo`
    ) {
      await context.reply(`Ah, okay. Glad to hear it!`)
      return
    }

    const res = await ioInterface.crew.leave(
      context.ship.id,
      context.crewMember.id,
    )
    await context.reply(res || `You have left the ship.`)

    // remove role
    const memberRole = await resolveOrCreateRole({
      type: `crew`,
      context,
    })
    try {
      if (memberRole && !(`error` in memberRole)) {
        if (
          (
            (`cache` in context.guildMember.roles
              ? context.guildMember.roles.cache.map((r) => r.name)
              : context.guildMember.roles) as string[]
          ).find((r) => r === memberRole.name)
        ) {
          c.log(
            `cache` in context.guildMember.roles
              ? context.guildMember.roles.cache.map((r) => r.name)
              : context.guildMember.roles,
          )
          const gm = await context.getUserInGuildFromId(context.author.id)
          if (gm) gm.roles.remove(memberRole).catch((e) => c.log(e))
        }
      }
    } catch (e) {
      c.log(e)
    }
  },
}

export default command
