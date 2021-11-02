import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import type { CommandContext } from '../models/CommandContext'

const roleData: {
  [key in GameRoleType]: {
    name: string
  }
} = {
  crew: {
    name: `Starfish Crew`,
  },
}

export default async function resolveOrCreateRole({
  type,
  context,
}: {
  type: GameRoleType
  context: CommandContext
}): Promise<Discord.Role | null | GamePermissionsFailure> {
  if (!context.guild) return null

  const { name } = roleData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_ROLES`],
    guild: context.guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingRoles = [
    ...(await context.guild.roles.cache).values(),
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
      (await context.guild.roles
        .create({
          name,
          hoist: false,
          mentionable: true,
          position: 99999,
          reason: `Game initialization`,
        })
        .catch(c.log)) || null

    c.log(`Created role ${name} for ${context.guild.name}.`)

    return role
  } catch (e) {
    c.log(`red`, `failed to create role:`, e)
    return null
  }
}
