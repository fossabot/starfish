import c from '../../../common/dist'
import {
  MessageOptions,
  Message,
  Guild,
  NewsChannel,
} from 'discord.js'
import type { CommandContext } from './models/CommandContext'
import { GameChannel } from './models/GameChannel'
import checkPermissions from './actions/checkPermissions'
import resolveOrCreateChannel from './actions/resolveOrCreateChannel'

const sendQueue: {
  [key: string]: {
    message: string | MessageOptions
    channel?: GameChannel
    channelType?: GameChannelType
    context?: CommandContext
    sent: Promise<
      Message | GamePermissionsFailure | { error: string }
    >
  }[]
} = {}

export async function enQueue({
  guild,
  message,
  channel,
  channelType,
  context,
}: {
  guild: Guild
  message: string | MessageOptions
  channel?: GameChannel
  channelType?: GameChannelType
  context?: CommandContext
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
    // c.log(`waiting for`, pendingMessages.length)
    await Promise.all(pendingMessages)

    // --

    // if we need to get a channel by type
    if (!channel && channelType) {
      // check if it's already known
      // todo this can't be true atm, save HERE instead and remove properly if it fails
      if (context?.channels[channelType])
        channel = context?.channels[channelType]

      // try to make or resolve a channel
      if (!channel) {
        // check permissions
        const createChannelsPermissionsCheck =
          await checkPermissions({
            requiredPermissions: [`MANAGE_CHANNELS`],
            guild: guild,
          })
        if (`error` in createChannelsPermissionsCheck) {
          // permissions check failed
          c.log(
            `Failed to create channel!`,
            createChannelsPermissionsCheck,
          )
          context?.contactGuildAdmin(
            createChannelsPermissionsCheck,
          )
        } else {
          // permissions check passed, create
          const didCreate = await resolveOrCreateChannel({
            type: channelType,
            guild,
          })
          if (didCreate) channel = didCreate
        }
      }
    }

    // otherwise send back to the channel we got the message in in the first place, if available
    if (
      !channel &&
      context &&
      !(
        context.initialMessage.channel instanceof
        NewsChannel
      ) &&
      !context.initialMessage.channel?.partial &&
      context.initialMessage.channel?.type === `GUILD_TEXT`
    ) {
      channel = new GameChannel(
        null,
        context.initialMessage.channel,
      )
    }

    let sendResult:
      | Message
      | GamePermissionsFailure
      | { error: string }

    // * send (permissions checks handled on channel object)
    if (channel) {
      sendResult = await channel.send(message)
      if (`error` in sendResult)
        context?.contactGuildAdmin(sendResult)
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
