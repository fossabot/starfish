import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import { client } from '..'

export default async function checkPermissions({
  requiredPermissions,
  channel,
  guild,
  guildId,
}: {
  requiredPermissions: Discord.PermissionString[]
  channel?: Discord.TextChannel | Discord.DMChannel
  guild?: Discord.Guild
  guildId?: string
}): Promise<GamePermissionsResponse> {
  if (!client || !client.readyAt)
    return { error: `Client not ready` }
  if (channel instanceof Discord.DMChannel)
    return { ok: true }
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

  const useBasePermissions = !channel

  // -------------- get permissions
  let permissionsToCheck
  const allRoles = await guild.roles.fetch().catch((e) => {
    c.log(`red`, `Error getting bot permissions:`, e)
  })
  const botRole = allRoles
    ? [...allRoles.values()].find(
        (role: Discord.Role) =>
          role.name === client.user?.username,
      )
    : null

  permissionsToCheck = botRole?.permissions
  if (!useBasePermissions && channel && guild.me) {
    permissionsToCheck = channel.permissionsFor(guild.me)
  }
  if (!permissionsToCheck) {
    c.log({
      error: `Was looking for permissions in ${guild.name} (${guild.id}), but failed to find any bot-applicable permissions.`,
      botRole,
      channel,
      me: guild.me,
    })
    return {
      error: `Was looking for permissions in your server, but failed to find any bot-applicable permissions.`,
    }
  }

  // c.log(permissionsToCheck.toArray())

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
    }bot permission${
      missingPermissions.length === 1 ? `` : `s`
    } \`${missingPermissions.join(`\`, \``)}\`${
      useBasePermissions
        ? ``
        : ` in channel \`#${channel?.name}\``
    }`,
    missingPermissions,
    usedChannelSpecificPermissions: !useBasePermissions,
  }
}
