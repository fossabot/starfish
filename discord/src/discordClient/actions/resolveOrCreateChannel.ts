import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import { GameChannel } from '../models/GameChannel'
import resolveOrCreateRole from './resolveOrCreateRole'
import { client } from '..'
import type { InteractionContext } from '../models/getInteractionContext'

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
  guild,
}:
  | {
      type: GameChannelType
      context: InteractionContext
      guild?: Discord.Guild
    }
  | {
      type: GameChannelType
      context?: InteractionContext
      guild: Discord.Guild
    }): Promise<GameChannel | null | GamePermissionsFailure> {
  if (!context && !guild) return null
  if (context && !guild) guild = context.guild || undefined
  if (!guild) return null

  const { name, topic, permissions } = channelData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_CHANNELS`],
    guild: guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context?.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingChannels = [...(await guild.channels.cache).values()]
  let existingSubChannels: Discord.TextChannel[] = []
  let parentCategory: Discord.CategoryChannel | null = null

  // ----- get/make category -----
  const existingCategory = existingChannels.find(
    (ch) => ch instanceof Discord.CategoryChannel && ch.name === c.gameName,
  ) as Discord.CategoryChannel
  if (existingCategory) {
    parentCategory = existingCategory
    existingSubChannels = existingChannels.filter(
      (c) =>
        c instanceof Discord.TextChannel && c.parentId === existingCategory.id,
    ) as Discord.TextChannel[]
  } else {
    const botRole = guild.roles.cache.find(
      (r) => r.name === client.user?.username,
    )
    const crewRole = guild.roles.cache.find((r) => r.name === `Starfish Crew`)
    const everyone = guild.roles.cache.find((r) => r.name === `@everyone`)
    const createdCategory = await guild.channels
      .create(c.gameName, {
        type: `GUILD_CATEGORY`,
        position: 99999,
        reason: `Game initialization`,
        permissionOverwrites:
          crewRole && everyone && botRole
            ? [
                {
                  id: everyone,
                  deny: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                  id: crewRole,
                  allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                  id: botRole,
                  allow: [Discord.Permissions.FLAGS.VIEW_CHANNEL],
                },
              ]
            : undefined,
      })
      .catch(c.log)
    if (createdCategory) parentCategory = createdCategory
    c.log(`Created category channel for ${guild.name}.`)
  }

  if (!parentCategory) return { error: `No parent category` }

  // ----- get/make channel -----
  const existing = existingSubChannels.find(
    (c) => c.name === name.toLowerCase().replace(/\s/g, `-`),
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

  if (channel === null) return { error: `No channel created` }
  return new GameChannel(guild, channel)
}
