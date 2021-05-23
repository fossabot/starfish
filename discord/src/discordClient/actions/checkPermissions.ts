import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import { client } from '..'

interface GamePermissionsFailure {
  error: string
  missingPermissions?: Discord.PermissionString[]
  usedBasePermissions?: boolean
}
interface GamePermissionsSuccess {
  ok: true
  message?: string
}
type GamePermissionsResponse =
  | GamePermissionsFailure
  | GamePermissionsSuccess

export default async function checkPermissions({
  requiredPermissions,
  channel,
  guild,
  guildId,
}: {
  requiredPermissions: Discord.PermissionString[]
  channel?: Discord.TextChannel
  guild?: Discord.Guild
  guildId?: string
}): Promise<GamePermissionsResponse> {
  if (!client || !client.readyAt)
    return { error: `Client not ready` }
  // -------------- get Discord guild and channel objects
  if (channel) guild = channel.guild
  if (!guild && guildId)
    guild = await client.guilds.fetch(guildId)
  if (!guild) return { error: `No guild found` }

  // if (channel || channelId) {
  //   // re-fetch so that we have overwrites
  //   channel = ((await guild.channels.fetch()) || []).find(
  //     (c) => c.id === channel?.id || channelId,
  //   )
  //   if (!channel)
  //     return { error: `No channel found by id ${channelId}` }
  //   if (channel.type !== `text`)
  //     return { error: `Wrong channel type: ${channel.type}` }
  // }
  if (channel && channel.type !== `text`)
    return { error: `Wrong channel type: ${channel.type}` }

  const useBasePermissions = !channel

  // -------------- get permissions
  let permissionsToCheck
  const botRole = (await guild.roles.fetch()).cache
    .array()
    .find((role) => role.name === client.user?.username)
  permissionsToCheck = botRole?.permissions
  if (!useBasePermissions && channel && guild.me) {
    permissionsToCheck = channel.permissionsFor(guild.me)
  }
  if (!permissionsToCheck)
    return { error: `Failed to find bot permissions` }

  // -------------- check permissions
  const missingPermissions: Discord.PermissionString[] = []
  for (let p of requiredPermissions)
    if (!permissionsToCheck.has(p))
      missingPermissions.push(p as Discord.PermissionString)

  // -------------- ok
  if (!missingPermissions.length) return { ok: true }

  // -------------- not ok
  return {
    error: `Missing ${
      useBasePermissions ? `overall ` : ``
    }bot permissions \`${missingPermissions.join(
      `\`, \``,
    )}\`${
      useBasePermissions
        ? ``
        : ` in channel \`${channel?.name}\``
    }`,
    missingPermissions,
    usedBasePermissions: useBasePermissions,
  }
}
