import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import { client } from '..'

export class GameChannel {
  private readonly guild: Discord.Guild | null
  readonly channel: Discord.TextChannel | Discord.DMChannel
  readonly listeners: Function[] = []

  constructor(
    guild: Discord.Guild | null,
    channel: Discord.TextChannel | Discord.DMChannel,
  ) {
    this.guild = guild
    this.channel = channel
  }

  async send(message: string | Discord.MessageEmbed) {
    return await this.channel.send(message).catch(c.log)
  }

  registerListener(listener: Function) {}
}
