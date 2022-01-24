import c from '../../../common/dist'
import {
  MessageOptions,
  Message,
  Guild,
  NewsChannel,
  Role,
  MessageEmbed,
} from 'discord.js'
import { GameChannel } from './models/GameChannel'
import checkPermissions from './actions/checkPermissions'
import resolveOrCreateChannel from './actions/resolveOrCreateChannel'
import { roleData } from './actions/resolveOrCreateRole'
import type { InteractionContext } from './models/getInteractionContext'

const sendQueue: {
  [key: string]: {
    message: string | MessageOptions
    channel?: GameChannel
    channelType?: GameChannelType
    context?: InteractionContext
    sent: Promise<Message | GamePermissionsFailure | { error: string }>
  }[]
} = {}

export async function enQueue({
  guild,
  message,
  channel,
  channelType,
  context,
  notify,
}: {
  guild: Guild
  message: string | MessageOptions
  channel?: GameChannel
  channelType?: GameChannelType
  context?: InteractionContext
  notify?: boolean
}) {
  let queue = sendQueue[guild.id]

  if (!queue) {
    sendQueue[guild.id] = []
    queue = sendQueue[guild.id]
  }
  // collect all previous pending pessages
  const pendingMessages = [...queue.map((q) => q.sent)]

  const sendFunction = async (resolve) => {
    // * wait for all previous pending messages to complete
    await Promise.all(pendingMessages)

    // if we need to get a channel by type
    if (!channel && channelType) {
      // check if it's already known
      // todo this can't be true atm, save HERE instead and remove properly if it fails
      // if (context?.channels[channelType])
      //   channel = context?.channels[channelType]

      // try to make or resolve a channel
      if (!channel && (context || guild)) {
        // permissions check + create
        const didCreate = await resolveOrCreateChannel({
          type: channelType,
          context,
          guild,
        })
        if (didCreate && !(`error` in didCreate)) channel = didCreate
      }
    }

    // otherwise send back to the channel we got the message in in the first place, if available
    if (
      !channel &&
      context &&
      !(context.channel instanceof NewsChannel) &&
      !context.channel?.partial &&
      context.channel?.type === `GUILD_TEXT`
    ) {
      channel = new GameChannel(null, context.channel)
    }

    if (notify) {
      // find the Crew role to @mention
      const roleName = roleData.crew.name
      const atRole = guild.roles.cache.find((r) => r.name === roleName)
      if (atRole) {
        if (typeof message === `string`) message = `<@&${atRole.id}> ${message}`
        else if (message.embeds?.[0])
          message.embeds[0].description = `<@&${atRole.id}> ${message.embeds[0].description}`
      }
    }

    let sendResult: Message | GamePermissionsFailure | { error: string }

    // * send (permissions checks handled on channel object)
    if (channel) {
      sendResult = await channel.send(message)
      if (`error` in sendResult) context?.contactGuildAdmin(sendResult)
    } else {
      sendResult = {
        error: `No channel found/created to send to.`,
      }
    }

    queue.splice(
      queue.findIndex((q) => q.sent === sendPromise),
      1,
    )

    resolve(sendResult)
  }

  const sendPromise = new Promise<
    Message | GamePermissionsFailure | { error: string }
  >(sendFunction)

  // * push this message to the queue so that other incoming messages wait for it
  queue.push({
    message,
    channel,
    channelType,
    context,
    sent: sendPromise,
  })

  return sendPromise
}
