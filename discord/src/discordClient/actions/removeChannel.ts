import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import { GameChannel } from '../models/GameChannel'

export default async function removeChannel({
  name,
  guild,
}: {
  name: string
  guild: Discord.Guild
}): Promise<
  true | GamePermissionsFailure | { error: string }
> {
  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    return permissionsRes
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

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
