import c from '../../../../common/dist'
import {
  DMChannel,
  Guild,
  GuildMember,
  Message,
  MessageOptions,
  NewsChannel,
  TextChannel,
  MessageEmbed,
  User,
} from 'discord.js'
import resolveOrCreateChannel from '../actions/resolveOrCreateChannel'
import { GameChannel } from './GameChannel'
import type { Command } from './Command'
import checkPermissions from '../actions/checkPermissions'
import { error } from 'console'
import { enQueue } from '../sendQueue'
import ioInterface from '../../ioInterface'

const sendQueue: {
  [key: string]: {
    busy: boolean
    messages: {
      message: string | MessageOptions
      channelType?: GameChannelType
    }[]
  }
} = {}

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

  isCaptain: boolean

  matchedCommands: Command[] = []

  readonly channels: {
    [key in GameChannelType]?: GameChannel
  } = {} // todo this is useless!!

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
    this.dm = message.channel.type === `DM`
    this.isCaptain = Boolean(
      this.ship && this.author.id === this.ship?.captain,
    )
    this.isServerAdmin =
      message.guild?.members.cache
        .find((m) => m.id === message.author.id)
        ?.permissions.has(`BAN_MEMBERS`) || false
    this.isGameAdmin = [
      `244651135984467968`,
      `395634705120100367`,
    ].includes(message.author.id)
  }

  async refreshShip() {
    const ship = await ioInterface.ship.get(
      this.guild?.id || ``,
      this.author.id,
    )
    this.ship = ship
    this.crewMember =
      ship?.crewMembers?.find(
        (cm) => cm.id === this.author.id,
      ) || null
  }

  async sendToGuild(
    message: string | MessageOptions,
    channelType: GameChannelType = `alert`,
  ) {
    if (!this.guild) return

    return enQueue({
      guild: this.guild,
      channelType,
      context: this,
      message,
    })
  }

  async reply(message: string | MessageOptions) {
    if (
      !this.initialMessage.channel ||
      this.initialMessage.channel instanceof NewsChannel ||
      this.initialMessage.channel.partial ||
      this.initialMessage.channel.type !== `GUILD_TEXT`
    )
      return

    let channel = new GameChannel(
      null,
      this.initialMessage.channel,
    )

    if (!this.guild) return channel.send(message)

    return enQueue({
      guild: this.guild,
      channel,
      context: this,
      message,
    })
  }

  async contactGuildAdmin(error: GamePermissionsFailure) {
    const possibleContacts = await this.getAdminContacts()
    if (!possibleContacts.length) return

    c.log(
      `gray`,
      `Contacting guild admin in ${this.guild?.name}`,
    )

    const contact = possibleContacts[0]
    try {
      const message = `**Hello from Starfish!**
Sorry to bother you, but it looks like I've run into a problem in your server \`${this.guild?.name}\`.
The error message that I generated is:

> ${error.error}

I hope that that looks like something you can sort out!
If you're not sure what to do, please reach out in the [support server](${c.supportServerLink}).`
      contact.send({
        embeds: [
          new MessageEmbed({
            description: message,
          }),
        ],
      })
    } catch (e) {
      c.log(`Failed to contact guild admin.`)
    }
  }

  async reactToInitialMessage(emoji: string) {
    if (this.initialMessage.channel.type !== `GUILD_TEXT`)
      return
    const canReact = await checkPermissions({
      requiredPermissions: [`ADD_REACTIONS`],
      channel: this.initialMessage.channel,
      guild: this.guild || undefined,
    })
    if (`error` in canReact) {
      this.contactGuildAdmin(canReact)
      return
    }
    try {
      await this.initialMessage.react(emoji).catch(c.log)
    } catch (e) {
      c.log(`Failed to react to message.`, emoji, e)
    }
  }

  async getGuildMembers(ids?: string[]) {
    if (!this.guild) return []
    let members: GuildMember[] = []
    if (!ids) {
      // just get everything
      try {
        members = [
          ...(
            await this.guild.members.fetch().catch((e) => {
              console.log(e)
              return []
            })
          ).values(),
        ]
      } catch (e) {
        members = [
          ...(await this.guild.members.fetch()).values(),
        ]
        c.log(
          `failed to get ${members.length} guild members`,
        )
      }
    }
    // get specific ids
    else {
      try {
        members = [
          ...(
            await this.guild.members
              .fetch({ user: ids })
              .catch((e) => {
                console.log(e)
                return []
              })
          ).values(),
        ]
      } catch (e) {
        c.log(
          `failed to get ${members.length} guild members`,
        )
      }
    }

    return members
  }

  async getUserInGuildFromId(id?: string) {
    if (!this.guild || !id) return
    try {
      const userInGuild = await this.guild.members.fetch({
        user: id,
      })
      return userInGuild
    } catch (e) {}
  }

  async getAdminContacts(): Promise<GuildMember[]> {
    if (!this.guild) return []

    // check guild.owner
    const owner = await this.getUserInGuildFromId(
      this.guild.ownerId,
    )
    if (owner) return [owner]

    // at this point, we just look for an admin of any kind
    const usersToContact = (
      await this.getGuildMembers()
    ).filter((member) =>
      member.permissions.has(`ADMINISTRATOR`),
    )
    return usersToContact
  }
}
