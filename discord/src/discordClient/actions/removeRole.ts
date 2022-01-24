import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from './checkPermissions'
import { InteractionContext } from '../models/getInteractionContext'

export default async function removeRole({
  name,
  context,
  guild,
}:
  | {
      name: GameRoleType
      context: InteractionContext
      guild?: Discord.Guild
    }
  | {
      name: GameRoleType
      context?: InteractionContext
      guild: Discord.Guild
    }): Promise<true | GamePermissionsFailure | { error: string }> {
  if (!context && !guild)
    return {
      error: `No context or guild provided to removeRole`,
    }
  if (context && !guild) guild = context.guild || undefined
  if (!guild)
    return {
      error: `No context or guild provided to removeRole`,
    }

  const permissionsRes = await checkPermissions({
    requiredPermissions: [`MANAGE_ROLES`],
    guild,
  })
  if (`error` in permissionsRes) {
    c.log(permissionsRes)
    context?.contactGuildAdmin(permissionsRes)
    return permissionsRes
  }

  const existingRoles = [...(await guild.roles.cache).values()]

  const existing = existingRoles.find((c) => c.name === name)
  if (existing) {
    try {
      existing.delete().catch(c.log)
    } catch (e) {
      c.log(e)
    }
    return true
  }

  return { error: `No role found to remove.` }
}
