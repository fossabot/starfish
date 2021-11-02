import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import type { CommandContext } from '../models/CommandContext'

export const roleData: {
  [key in GameRoleType]: {
    name: string
    color: `#${string}`
  }
} = {
  crew: {
    name: `Starfish Crew`,
    color: c.gameColor as any,
  },
}

export default async function resolveOrCreateRole({
  type,
  context,
  guild,
}:
  | {
      type: GameRoleType
      context: CommandContext
      guild?: Discord.Guild
    }
  | {
      type: GameRoleType
      context?: CommandContext
      guild: Discord.Guild
    }): Promise<
  Discord.Role | null | GamePermissionsFailure
> {
  if (!context && !guild) return null
  if (context && !guild) guild = context.guild || undefined
  if (!guild) return null

  const { name, color } = roleData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_ROLES`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context?.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingRoles = [
    ...(await guild.roles.cache).values(),
  ]

  // ----- get/make role -----
  const existing = existingRoles.find(
    (c) => c.name === name,
  )
  if (existing) {
    // c.log(`found existing role...`)
    return existing
  }

  try {
    // c.log(`attempting to create role...`)
    const role =
      (await guild.roles
        .create({
          name,
          color,
          hoist: false,
          mentionable: true,
          position: 99999,
          reason: `Game initialization`,
        })
        .catch(c.log)) || null

    c.log(`Created role ${name} for ${guild.name}.`)

    return role
  } catch (e) {
    c.log(`red`, `failed to create role:`, e)
    return null
  }
}
