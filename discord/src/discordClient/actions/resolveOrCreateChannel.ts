import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import { GameChannel } from '../models/GameChannel'

export const channelData: {
  [key in GameChannelType]: {
    name: string
    topic: string
    permissions?: Discord.OverwriteResolvable[]
  }
} = {
  alert: {
    name: `🚀alerts`,
    topic: `Automated ship alerts. Go to ${c.frontendUrl} to take action!`,
    permissions: [],
  },
  chat: {
    name: `🛠main-deck`,
    topic: `For full-crew discussions.`,
  },
  broadcast: {
    name: `📣comms-bay`,
    topic: `Area chatter and received broadcasts come here. Send messages here to message ships within your broadcast range.`,
  },
}

export default async function resolveOrCreateChannel({
  type,
  guild,
}: {
  type: GameChannelType
  guild: Discord.Guild
}): Promise<GameChannel | null> {
  const { name, topic, permissions } = channelData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    return null
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingChannels = [
    ...(await guild.channels.cache).values(),
  ]
  let existingSubChannels: Discord.TextChannel[] = []
  let parentCategory: Discord.CategoryChannel | null = null

  // ----- get/make category -----
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
  } else {
    const createdCategory = await guild.channels
      .create(c.gameName, {
        type: `GUILD_CATEGORY`,
        position: 99999,
        reason: `Game initialization`,
      })
      .catch(c.log)
    if (createdCategory) parentCategory = createdCategory
    c.log(`Created category channel for ${guild.name}.`)
  }

  if (!parentCategory) return null

  // ----- get/make channel -----
  const existing = existingSubChannels.find(
    (c) =>
      c.name === name.toLowerCase().replace(/\s/g, `-`),
  )
  if (existing) return new GameChannel(guild, existing)

  const channel =
    (await guild.channels
      .create(name, {
        reason: `Game initialization`,
        parent: parentCategory,
        topic,
        permissionOverwrites: permissions,
      })
      .catch(c.log)) || null

  c.log(`Created channel ${name} for ${guild.name}.`)

  if (channel === null) return null
  return new GameChannel(guild, channel)
}
