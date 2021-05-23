import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import { client } from '..'
import checkPermissions from './checkPermissions'
import { GameChannel } from '../models/GameChannel'

const channelData: {
  [key in GameChannelType]: {
    name: string
    topic: string
    permissions?: Discord.OverwriteResolvable[]
  }
} = {
  alert: {
    name: `🚀Alerts`,
    topic: `Automated ship alerts. Go to ${process.env.FRONTEND_URL} to take action!`,
    permissions: [],
  },
  chat: {
    name: `🛠Main Deck`,
    topic: `For full-crew discussions.`,
  },
  broadcast: {
    name: `📣Comms Bay`,
    topic: `Area chatter and received broadcasts come here. Send messages here to broadcast them within your interaction range.`,
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

  const existingChannels =
    await guild.channels.cache.array()
  let existingSubChannels: Discord.TextChannel[] = []
  let parentCategory: Discord.CategoryChannel | null = null

  // ----- get/make category -----
  const existingCategory = existingChannels.find(
    (ch) =>
      ch instanceof Discord.CategoryChannel &&
      ch.name === c.GAME_NAME,
  ) as Discord.CategoryChannel
  if (existingCategory) {
    parentCategory = existingCategory
    existingSubChannels = existingChannels.filter(
      (c) =>
        c instanceof Discord.TextChannel &&
        c.parentID === existingCategory.id,
    ) as Discord.TextChannel[]
  } else {
    const createdCategory = await guild.channels
      .create(c.GAME_NAME, {
        type: `category`,
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

//
//
// // ----- get bot role -----
// const existingRoles = (
//   await guild.roles.fetch()
// ).cache.array()
// const botRole = existingRoles.find(
//   (role) => role.name === client.user?.username,
// )
// if (!botRole) {
//   return null
// }
//
//
