import c from '../../../../common/dist'
import {
  DMChannel,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
  User,
} from 'discord.js'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'
import { GameChannel } from './GameChannel'
import type { Command } from './Command'

/** a user-given command extracted from a message. */
export class CommandContext {
  /** command name in all lowercase. */
  readonly commandName: string
  readonly correctPrefix: boolean

  /** arguments (pre-split by space). */
  readonly args: string[]
  /** arguments not split by space. */
  readonly rawArgs: string

  /** original message the command was extracted from. */
  readonly initialMessage: Message
  readonly author: User
  readonly guildMember?: GuildMember
  readonly nickname: string

  readonly commandPrefix: string

  readonly dm: boolean

  readonly isServerAdmin: boolean
  readonly isGameAdmin: boolean

  readonly guild: Guild | null

  ship: ShipStub | null = null

  crewMember: CrewMemberStub | null = null

  isCaptain: boolean = false

  matchedCommands: Command[] = []

  readonly channels: {
    [key in GameChannelType]?: GameChannel
  } = {}

  constructor(message: Message, prefix: string) {
    this.commandPrefix = prefix
    const splitMessage = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)
    this.correctPrefix =
      message.content.slice(0, prefix.length) === prefix

    this.commandName = splitMessage.shift()!.toLowerCase()
    this.args = splitMessage
    this.rawArgs = splitMessage.join(` `)
    this.initialMessage = message
    this.author = message.author
    this.guildMember = message.guild?.members.cache.find(
      (m) => m.user.id === message.author.id,
    )
    this.nickname =
      this.guildMember?.nickname || this.author.username
    this.guild = message.guild
    this.dm = message.channel.type === `dm`
    this.isServerAdmin =
      message.guild?.members.cache
        .find((m) => m.id === message.author.id)
        ?.permissions.has(`BAN_MEMBERS`) || false
    this.isGameAdmin = [
      `244651135984467968`,
      `395634705120100367`,
    ].includes(message.author.id)
  }

  async sendToGuild(
    message: string | MessageEmbed,
    channelType: GameChannelType = `alert`,
  ) {
    let channel: GameChannel | null = null
    // try to resolve a channel
    if (this.guild) {
      channel =
        this.channels[channelType] ||
        (await resolveOrCreateChannel({
          type: channelType,
          guild: this.guild,
        }))
    }

    // otherwise send back to the channel we got the message in in the first place
    if (
      !channel &&
      !(this.initialMessage.channel instanceof NewsChannel)
    )
      channel = new GameChannel(
        null,
        this.initialMessage.channel,
      )
    // send
    if (channel) {
      this.channels[channelType] = channel
      channel.send(message).catch(c.log)
    }
  }

  async reply(message: string | MessageEmbed) {
    if (this.initialMessage.channel instanceof NewsChannel)
      return

    let channel = new GameChannel(
      null,
      this.initialMessage.channel,
    )
    // send
    if (channel) {
      channel.send(message).catch(c.log)
    }
  }

  async reactToInitialMessage(emoji: string) {
    await this.initialMessage.react(emoji).catch(c.log)
  }
}
