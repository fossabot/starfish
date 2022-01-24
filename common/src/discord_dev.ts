const discordBotId = `886820342016925776` // dev is `723017262369472603`
const discordBotPermissionsString = `335670352`
const frontendUrl = `https://localhost`
const discordBotInviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordBotId}&permissions=${discordBotPermissionsString}&scope=applications.commands%20bot`

export default {
  discordBotId,
  discordBotPermissionsString,
  frontendUrl,
  discordBotInviteUrl,
}
