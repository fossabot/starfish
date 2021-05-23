import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import { GameChannel } from './GameChannel'

export class GameGuild {
  readonly guild: Discord.Guild
  readonly channelReferences: GameChannelReference[]
  readonly channels: {
    [key in GameChannelType]?: GameChannel
  } = {}

  constructor({
    guild,
    channelReferences,
  }: {
    guild: Discord.Guild
    channelReferences: GameChannelReference[]
  }) {
    this.guild = guild
    this.channelReferences = channelReferences
    c.log(
      `Loaded ${channelReferences.length} channel references for ${guild.name}.`,
    )
  }

  async send(
    message: string | Discord.MessageEmbed,
    channelType: GameChannelType,
  ) {
    c.log(
      `messaging`,
      channelType,
      Boolean(this.channels[channelType]),
      this.channels[channelType]?.type,
    )
    // ----- auto-create channel if it doesn't exist -----
    if (!this.channels[channelType]) {
      let ref: GameChannelReference | undefined =
        this.channelReferences.find(
          (r) => r.type === channelType,
        )
      if (!ref) {
        ref = { type: channelType }
        this.channelReferences.push(ref)
      }
      this.channels[channelType] = new GameChannel(
        this.guild,
        ref,
      )
      ref.id = this.channels[channelType]?.channel?.id
    }

    // send
    if (this.channels[channelType])
      await this.channels[channelType]?.send(message)
    else
      c.log(
        `red`,
        `Failed to send message in ${channelType} channel for guild ${this.guild.name}.`,
      )
  }
}
