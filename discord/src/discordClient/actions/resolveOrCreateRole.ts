import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'

const roleData: {
  [key in GameRoleType]: {
    name: string
  }
} = {
  crew: {
    name: `Crew`,
  },
}

export default async function resolveOrCreateRole({
  type,
  guild,
}: {
  type: GameRoleType
  guild: Discord.Guild
}): Promise<Discord.Role | null> {
  const { name } = roleData[type]

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_ROLES`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    return null
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingRoles = await guild.roles.cache.array()

  // ----- get/make role -----
  const existing = existingRoles.find(
    (c) => c.name === name,
  )
  if (existing) return existing

  const role =
    (await guild.roles
      .create({
        data: {
          name,
          hoist: false,
          mentionable: true,
          position: 99999,
        },
        reason: `Game initialization`,
      })
      .catch(c.log)) || null

  c.log(`Created role ${name} for ${guild.name}.`)

  return role
}
