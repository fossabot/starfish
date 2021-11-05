import c from '../../../../common/dist'
import { CommandContext } from '../models/CommandContext'
import type { Command } from '../models/Command'
import ioInterface from '../../ioInterface'

import { channelData } from '../actions/resolveOrCreateChannel'
import { roleData } from '../actions/resolveOrCreateRole'
import removeChannel from '../actions/removeChannel'
import removeRole from '../actions/removeRole'

import waitForSingleButtonChoice from '../actions/waitForSingleButtonChoice'
import { ColorResolvable, MessageEmbed } from 'discord.js'

export class ShipLeaveGameCommand implements Command {
  requiresShip = true
  requiresCaptain = true

  commandNames = [`leavegame`]

  getHelpMessage(commandPrefix: string): string {
    return `\`${commandPrefix}${this.commandNames[0]}\` - Remove your server from the game.`
  }

  async run(context: CommandContext): Promise<void> {
    if (!context.guild) return

    const {
      result: deleteChannelsConfirmResult,
      sentMessage: pm,
    } = await waitForSingleButtonChoice({
      context,
      content: [
        new MessageEmbed({
          color: `RED`,
          title: `Wait, really?`,
          description: `This will **permanently** delete your ship and all of its crew members from the game.
It will also remove the game's discord channels.

Is that okay with you?`,
        }),
      ],
      allowedUserId: context.initialMessage.author.id,
      buttons: [
        {
          label: `Delete My Ship`,
          style: `DANGER`,
          customId: `deleteShipYes`,
        },
        {
          label: `Don't Delete`,
          style: `SECONDARY`,
          customId: `deleteShipNo`,
        },
      ],
    })
    if (pm) pm.delete().catch((e) => {})

    if (
      !deleteChannelsConfirmResult ||
      deleteChannelsConfirmResult === `deleteShipNo`
    ) {
      await context.reply(`Ah, okay. Glad to hear it!`)
      return
    }

    // remove channels
    for (let channelName of Object.values(channelData).map(
      (ch) => ch.name,
    )) {
      const res = await removeChannel({
        name: channelName as GameChannelType,
        guild: context.guild,
      })
      if (res !== true) c.log(res.error)
    }
    const categoryRes = await removeChannel({
      name: c.gameName as GameChannelType,
      guild: context.guild,
    })
    if (categoryRes !== true) c.log(categoryRes.error)

    // remove roles
    for (let roleName of Object.values(roleData).map(
      (r) => r.name,
    )) {
      const res = await removeRole({
        name: roleName as GameRoleType,
        guild: context.guild,
      })
      if (res !== true) c.log(res.error)
    }

    // remove ship
    const res = await ioInterface.ship.destroy(
      context.guild.id,
    )

    if (res) context.reply(res)
  }

  hasPermissionToRun(
    commandContext: CommandContext,
  ): string | true {
    if (commandContext.dm)
      return `This command can only be invoked in a server.`
    if (
      !commandContext.isCaptain &&
      !commandContext.isServerAdmin
    )
      return `Only the captain or a server admin may run this command.`
    if (!commandContext.ship)
      return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`
    return true
  }
}
