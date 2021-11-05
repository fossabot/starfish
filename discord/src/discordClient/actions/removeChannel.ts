import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import type { CommandContext } from '../models/CommandContext'

export default async function removeChannel({
  name,
  context,
  guild,
}:
  | {
      name: GameChannelType
      context: CommandContext
      guild?: Discord.Guild
    }
  | {
      name: GameChannelType
      context?: CommandContext
      guild: Discord.Guild
    }): Promise<
  true | GamePermissionsFailure | { error: string }
> {
  if (!context && !guild)
    return {
      error: `No context or guild provided to removeChannel`,
    }
  if (context && !guild) guild = context.guild || undefined
  if (!guild)
    return {
      error: `No context or guild provided to removeChannel`,
    }

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context?.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }

  const existingChannels = [
    ...(await guild.channels.cache).values(),
  ]
  let existingSubChannels: Discord.TextChannel[] = []
  let parentCategory: Discord.CategoryChannel | undefined

  // ----- get category and subchannels -----
  const existingCategory = existingChannels.find(
    (ch) =>
      ch instanceof Discord.CategoryChannel &&
      ch.name === c.gameName,
  ) as Discord.CategoryChannel
  if (existingCategory) {
    parentCategory = existingCategory
    existingSubChannels = existingChannels.filter(
      (c) =>
        c instanceof Discord.TextChannel &&
        c.parentId === existingCategory.id,
    ) as Discord.TextChannel[]
  }

  const existingChannel = [
    ...existingSubChannels,
    parentCategory,
  ].find((ch) => ch && ch.name === name)
  if (!existingChannel)
    return { error: `Channel not found` }

  try {
    await existingChannel.delete()
    c.log(`Deleted ${name} channel for ${guild.name}.`)
    return true
  } catch (e) {
    return {
      error: `Failed to delete channel: ${e}`,
    }
  }
}
