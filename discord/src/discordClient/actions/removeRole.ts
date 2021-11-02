import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'

export default async function removeRole(
  guild: Discord.Guild,
  roleName: string = `Crew`,
): Promise<boolean> {
  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_ROLES`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    return false
  }
  if (permissionsRes.message) c.log(permissionsRes.message)

  const existingRoles = [
    ...(await guild.roles.cache).values(),
  ]

  const existing = existingRoles.find(
    (c) => c.name === roleName,
  )
  if (existing) {
    c.log(`removing role...`)
    try {
      existing.delete().catch(c.log)
    } catch (e) {
      c.log(e)
    }
    return true
  }

  return false
}
