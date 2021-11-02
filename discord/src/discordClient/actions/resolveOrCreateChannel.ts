import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import { GameChannel } from '../models/GameChannel'
import type { CommandContext } from '../models/CommandContext'

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
  context,
}: {
  type: GameChannelType
  context: CommandContext
}): Promise<GameChannel | null | GamePermissionsFailure> {
  if (!context.guild) return null

  const { name, topic, permissions } = channelData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild: context.guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingChannels = [
    ...(await context.guild.channels.cache).values(),
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
    const createdCategory = await context.guild.channels
      .create(c.gameName, {
        type: `GUILD_CATEGORY`,
        position: 99999,
        reason: `Game initialization`,
      })
      .catch(c.log)
    if (createdCategory) parentCategory = createdCategory
    c.log(
      `Created category channel for ${context.guild.name}.`,
    )
  }

  if (!parentCategory) return null

  // ----- get/make channel -----
  const existing = existingSubChannels.find(
    (c) =>
      c.name === name.toLowerCase().replace(/\s/g, `-`),
  )
  if (existing)
    return new GameChannel(context.guild, existing)

  const channel =
    (await context.guild.channels
      .create(name, {
        reason: `Game initialization`,
        parent: parentCategory,
        topic,
        permissionOverwrites: permissions,
      })
      .catch(c.log)) || null

  c.log(
    `Created channel ${name} for ${context.guild.name}.`,
  )

  if (channel === null) return null
  return new GameChannel(context.guild, channel)
}
