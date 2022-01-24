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
  CommandInteraction,
  ColorResolvable,
  TextBasedChannels,
} from 'discord.js'
import { GameChannel } from './GameChannel'
import type { Command } from './Command'
import checkPermissions from '../actions/checkPermissions'
import { enQueue } from '../sendQueue'
import ioInterface from '../../ioInterface'
import {
  APIInteractionGuildMember,
  APIMessage,
  APIUser,
} from 'discord-api-types'
import commandList from '../commandList'

export interface InteractionContext {
  readonly commandName: string
  readonly args: any
  readonly author: User | APIUser
  readonly guildMember: GuildMember | APIInteractionGuildMember // can be fetched to get GuildMember
  readonly nickname: string
  readonly dm: boolean
  readonly isServerAdmin: boolean
  readonly isGameAdmin: boolean
  readonly guild: Guild | null
  readonly channel: TextBasedChannels | null
  ship: ShipStub | null
  crewMember: CrewMemberStub | null
  isCaptain: boolean
  command?: Command
  error?: string

  reply(
    message: string | MessageOptions,
  ): Promise<APIMessage | Message<boolean> | null>
  editReply(
    message: string | MessageOptions,
  ): Promise<Message<true> | APIMessage | Message<boolean> | null>
  deleteReply(): Promise<boolean>
  contactGuildAdmin(error: GamePermissionsFailure): void
  getGuildMembers(ids?: string[]): Promise<GuildMember[]>
  getUserInGuildFromId(id: string): Promise<GuildMember | undefined>
  getAdminContacts(): Promise<GuildMember[]>
  refreshShip(): Promise<ShipStub | null>
  sendToGuild(
    message: string | MessageOptions,
    channelType?: GameChannelType,
  ): Promise<any>
}

/** context and helper classes for an interaction */
export default function getInteractionContext(
  interaction: CommandInteraction,
  ship: ShipStub | null,
  crewMember?: CrewMemberStub,
) {
  let message: Message<boolean> | APIMessage | null = null
  const commandName = interaction.commandName
  const guild = interaction.guild
  const channel = interaction.channel
  const dm = interaction.channel instanceof DMChannel
  const guildMember = interaction.member as
    | GuildMember
    | APIInteractionGuildMember
  const author = guildMember.user as User | APIUser
  const nickname =
    (`nickname` in guildMember ? guildMember.nickname : author.username) ||
    author.username
  const isServerAdmin =
    interaction.guild?.members.cache
      .find((m) => m.id === author.id)
      ?.permissions.has(`BAN_MEMBERS`) || false
  const isGameAdmin = [`244651135984467968`, `395634705120100367`].includes(
    author.id,
  )
  const isCaptain = ship?.captain === author.id

  const command = commandList.find((co) => {
    return co.commandNames.includes(interaction.commandName)
  })

  const args: any = {}
  if (command?.args?.length) {
    for (let arg of command.args) {
      let value: any
      if (arg.type === `string`) value = interaction.options.getString(arg.name)
      if (arg.type === `number`) value = interaction.options.getNumber(arg.name)
      if (arg.type === `boolean`)
        value = interaction.options.getBoolean(arg.name)
      if (arg.type === `user`) value = interaction.options.getUser(arg.name)
      args[arg.name] = value
    }
  }

  // error handling
  let error: string | undefined
  if (!command) error = `Command not found`
  else if (dm && !command.allowDm)
    error = `\`${command.commandNames[0]}\` can only be invoked in a server.`
  else if (
    (command.requiresShip ||
      command.requiresCaptain ||
      command.requiresPlanet) &&
    !ship
  )
    error = `Your server doesn't have a ship yet! Use \`/start\` to start your server off in the game.`
  else if (
    ship &&
    command.requiresShip &&
    ![`leave`, `leavegame`].includes(command.commandNames[0]) &&
    ship.tutorial
  )
    error = `Discord commands are disabled while you're in the tutorial. Go to ${c.frontendUrl} to play!`
  else if (command.requiresCrewMember && !crewMember)
    error = `Only crew members can run the \`${command.commandNames[0]}\` command. Use \`/join\` to join the ship first.`
  else if (command.requiresPlanet && !ship?.planet)
    error = `You must be on a planet to use this command.`
  else if (
    command.requiresCaptain &&
    !(isCaptain || isServerAdmin || isGameAdmin)
  )
    error = `Only captain ${
      ship!.crewMembers?.find((cm) => cm.id === ship?.captain)?.name
    } or server admins can use this command.`

  const reply = async (m: string | MessageOptions) => {
    if (message) return editReply(m)

    if (typeof m === `string`)
      m = {
        embeds: [
          new MessageEmbed()
            .setColor(c.gameColor as ColorResolvable)
            .setDescription(m),
        ],
      }

    try {
      await interaction.reply({
        ...m,
        ephemeral: command?.replyEphemerally,
      })
    } catch (e) {
      return null
    }
    message = (await interaction.fetchReply()) as
      | APIMessage
      | Message<boolean>
      | Message<true>
      | null
    return message
  }

  const editReply = async (
    m: string | MessageOptions,
  ): Promise<Message<true> | APIMessage | Message<boolean> | null> => {
    if (typeof m === `string`)
      m = {
        embeds: [
          new MessageEmbed()
            .setColor(c.gameColor as ColorResolvable)
            .setDescription(m),
        ],
        components: [],
      }

    try {
      message = (await interaction.editReply({
        ...m,
      })) as Message<true> | APIMessage | Message<boolean>
    } catch (e) {
      return null
    }
    return message
  }

  const deleteReply = async () => {
    if (message) {
      try {
        await interaction.deleteReply()
      } catch (e) {
        return false
      }
      message = null
    }
    return true
  }

  const contactGuildAdmin = async (error: GamePermissionsFailure) => {
    const possibleContacts = await getAdminContacts()
    if (!possibleContacts.length) return

    c.log(`gray`, `Contacting guild admin in ${guild?.name}`)

    const contact = possibleContacts[0]
    try {
      const message = `**Hello from Starfish!**
Sorry to bother you, but it looks like I've run into a problem in your server \`${guild?.name}\`.
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

  const getGuildMembers = async (ids?: string[]) => {
    if (!guild) return []
    let members: GuildMember[] = []
    if (!ids) {
      // just get everything
      try {
        members = [
          ...(
            await guild.members.fetch().catch((e) => {
              c.log(e)
              return []
            })
          ).values(),
        ]
      } catch (e) {
        members = [...(await guild.members.fetch()).values()]
        c.log(`failed to get ${members.length} guild members`)
      }
    }
    // get specific ids
    else {
      try {
        members = [
          ...(
            await guild.members.fetch({ user: ids }).catch((e) => {
              c.log(e)
              return []
            })
          ).values(),
        ]
      } catch (e) {
        c.log(`failed to get ${members.length} guild members`)
      }
    }

    return members
  }

  const getUserInGuildFromId = async (id?: string) => {
    if (!guild || !id) return
    try {
      const userInGuild = await guild.members.fetch({
        user: id,
      })
      return userInGuild
    } catch (e) {}
  }

  const getAdminContacts = async (): Promise<GuildMember[]> => {
    if (!guild) return []

    // check guild.owner
    const owner = await getUserInGuildFromId(guild.ownerId)
    if (owner) return [owner]

    // at this point, we just look for an admin of any kind
    const usersToContact = (await getGuildMembers()).filter((member) =>
      member.permissions.has(`ADMINISTRATOR`),
    )
    return usersToContact
  }

  const refreshShip = async () => {
    const updatedShip = await ioInterface.ship.get(guild?.id || ``, author.id)
    if (updatedShip && ship)
      for (let prop of Object.keys(updatedShip)) ship[prop] = updatedShip[prop]
    const newCrewMember =
      ship?.crewMembers?.find((cm) => cm.id === author.id) || null
    if (newCrewMember && crewMember)
      for (let prop of Object.keys(newCrewMember))
        crewMember[prop] = newCrewMember[prop]

    return updatedShip
  }

  const sendToGuild = async (
    message: string | MessageOptions,
    channelType: GameChannelType = `alert`,
  ) => {
    if (!guild) return

    return enQueue({
      guild: guild,
      channelType,
      context,
      message,
    })
  }

  const context: InteractionContext = {
    commandName,
    guild,
    channel,
    dm,
    author,
    guildMember,
    nickname,
    isServerAdmin,
    isGameAdmin,
    isCaptain,
    command,
    ship: ship || null,
    crewMember: crewMember || null,
    args,
    error,

    // methods
    reply,
    editReply,
    deleteReply,
    contactGuildAdmin,
    getGuildMembers,
    getUserInGuildFromId,
    getAdminContacts,
    refreshShip,
    sendToGuild,
  }

  return context
}

/*
    const splitMessage = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/g)
    this.correctPrefix = message.content.slice(0, prefix.length) === prefix

    this.commandName = splitMessage.shift()!.toLowerCase()
    this.args = splitMessage
    this.rawArgs = splitMessage.join(` `)
    this.initialMessage = message
    this.author = message.author
    this.guildMember = message.guild?.members.cache.find(
      (m) => m.user.id === message.author.id,
    )
    this.nickname = this.guildMember?.nickname || this.author.username
    this.guild = message.guild
    this.dm = message.channel.type === `DM`
    this.isCaptain = Boolean(this.ship && this.author.id === this.ship?.captain)
    this.isServerAdmin =
      message.guild?.members.cache
        .find((m) => m.id === message.author.id)
        ?.permissions.has(`BAN_MEMBERS`) || false
    this.isGameAdmin = [`244651135984467968`, `395634705120100367`].includes(
      message.author.id,
    )
  }

  async refreshShip() {
    const ship = await ioInterface.ship.get(
      this.guild?.id || ``,
      this.author.id,
    )
    this.ship = ship
    this.crewMember =
      ship?.crewMembers?.find((cm) => cm.id === this.author.id) || null
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

    let channel = new GameChannel(null, this.initialMessage.channel)

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

    c.log(`gray`, `Contacting guild admin in ${this.guild?.name}`)

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
    if (this.initialMessage.channel.type !== `GUILD_TEXT`) return
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
              c.log(e)
              return []
            })
          ).values(),
        ]
      } catch (e) {
        members = [...(await this.guild.members.fetch()).values()]
        c.log(`failed to get ${members.length} guild members`)
      }
    }
    // get specific ids
    else {
      try {
        members = [
          ...(
            await this.guild.members.fetch({ user: ids }).catch((e) => {
              c.log(e)
              return []
            })
          ).values(),
        ]
      } catch (e) {
        c.log(`failed to get ${members.length} guild members`)
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
    const owner = await this.getUserInGuildFromId(this.guild.ownerId)
    if (owner) return [owner]

    // at this point, we just look for an admin of any kind
    const usersToContact = (await this.getGuildMembers()).filter((member) =>
      member.permissions.has(`ADMINISTRATOR`),
    )
    return usersToContact
  }
}
*/
