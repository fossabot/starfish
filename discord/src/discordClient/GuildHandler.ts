import * as Discord from 'discord.js'
import { client } from '.'
import ioInterface from '../ioInterface'
import { GameGuild } from './models/GameGuild'

export class GuildHandler {
  readonly gameGuilds: { [key: string]: GameGuild } = {}

  start() {
    client.guilds.cache.array().forEach(async (guild) => {
      this.add(guild)
    })
  }

  async add(guild: Discord.Guild) {
    if (this.gameGuilds[guild.id])
      return this.gameGuilds[guild.id]

    const shipData = await ioInterface.ship.get(guild.id)
    const newGameGuild = new GameGuild({
      guild,
      channelReferences: shipData?.channelReferences || [],
    })
    this.gameGuilds[guild.id] = newGameGuild
    return newGameGuild
  }
}
