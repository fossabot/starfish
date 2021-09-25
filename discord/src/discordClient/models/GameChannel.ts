import c from '../../../../common/dist'
import * as Discord from 'discord.js'
import checkPermissions from '../actions/checkPermissions'

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

  async send(
    message: string | Discord.MessageOptions,
  ): Promise<GamePermissionsFailure | Discord.Message> {
    const permissionsRes = await this.canSend()
    if (`error` in permissionsRes) {
      return permissionsRes
    }

    try {
      const sent = await this.channel
        .send(message)
        .catch(c.log)
      if (sent) return sent
    } catch (e) {
      c.log(e)
    }

    return {
      error: `Failed to send in ${
        (this.channel as Discord.TextChannel).name
      }`,
    }
  }

  async canSend() {
    return checkPermissions({
      requiredPermissions: [`SEND_MESSAGES`],
      channel: this.channel,
      guild: this.guild || undefined,
    })
  }

  registerListener(listener: Function) {}
}
