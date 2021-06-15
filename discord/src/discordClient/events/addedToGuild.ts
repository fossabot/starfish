import c from '../../../../common/dist'
import { Guild } from 'discord.js'

export default async function (guild: Guild) {
  c.log(`green`, `Guild ${guild.name} has added the bot.`)
}
