interface GamePermissionsFailure {
  error: string
  missingPermissions?: Discord.PermissionString[]
  usedChannelSpecificPermissions?: boolean
}
interface GamePermissionsSuccess {
  ok: true
  message?: string
}
type GamePermissionsResponse =
  | GamePermissionsFailure
  | GamePermissionsSuccess
