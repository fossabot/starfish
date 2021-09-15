import c from '../../../common/dist'
import socketIo, { Socket } from 'socket.io-client'
import { client as discordClient } from '../discordClient'
import resolveOrCreateChannel from '../discordClient/actions/resolveOrCreateChannel'
import checkPermissions from '../discordClient/actions/checkPermissions'
import isDocker from 'is-docker'

import * as ship from './ship'
import * as crew from './crew'
import { isRegExp } from 'util/types'

export default {
  connected,
  ship,
  crew,
}

// connect to server
const serverUrl = `https://${isDocker() ? `game` : `localhost`}:4200`

const client = socketIo(serverUrl,
  { secure: true },
)
c.log(`Attempting to connect to game server at ${serverUrl}`)
export const io: Socket<IOServerEvents, IOClientEvents> =
  client.connect()

io.on(`connect`, () => {
  c.log(`green`, `Connected to game server at ${serverUrl}.`)
})

io.on(`disconnect`, () => {
  c.log(`red`, `Lost connection to game server.`)
})

io.on(
  `ship:message`,
  async (id, message, channelType = `alert`) => {
    const guild = discordClient.guilds.cache.find(
      (g) => g.id === id,
    )
    if (!guild)
      return c.log(
        `red`,
        `Message came for a guild that does not have the bot added on Discord.`,
      )

    // check to see if we have the necessary permissions to create channels
    const sendPermissionsCheck = await checkPermissions({
      requiredPermissions: [`MANAGE_CHANNELS`],
      guild: guild,
    })
    if (`error` in sendPermissionsCheck) {
      c.log(
        `Failed to create channel!`,
        sendPermissionsCheck,
      )
      return
    }

    const channel = await resolveOrCreateChannel({
      type: channelType,
      guild,
    })
    if (channel)
      channel.send(
        typeof message === `string`
          ? message
          : message
              .map((m: RichLogContentElement) => m.text)
              .join(` `),
      )
    else
      c.log(
        `red`,
        `Unable to resolve Discord channel to send message for guild ${guild.name}.`,
      )
  },
)

export function connected(): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (io.connected) {
      resolve(true)
      return
    }
    let timeout = 0
    while (timeout < 100) {
      // 10 seconds
      await c.sleep(100)
      if (io.connected) {
        resolve(true)
        return
      }
      timeout++
    }
    c.log(
      `yellow`,
      `Attempted to access game server io while socket was disconnected.`,
    )
    resolve(false)
  })
}
