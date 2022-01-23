import c from '../../../../common/dist'
import { Guild } from 'discord.js'
import ioInterface from '../../ioInterface'

export default async function (guild: Guild) {
  c.log(`yellow`, `Guild ${guild.name} has kicked the bot.`)
  // const ship = await ioInterface.ship.get(guild.id, ``)
  // if (ship) await ioInterface.ship.destroy(guild.id)
}
