import c from '../../../common/dist'
import { io as socketIo, Socket } from 'socket.io-client'
import { client as discordClient } from '../discordClient'
import resolveOrCreateChannel from '../discordClient/actions/resolveOrCreateChannel'
import checkPermissions from '../discordClient/actions/checkPermissions'
import isDocker from 'is-docker'

import * as ship from './ship'
import * as crew from './crew'
import { enQueue } from '../discordClient/sendQueue'

export default {
  connected,
  ship,
  crew,
}

// connect to server
let serverUrl = `http${isDocker() ? `s` : ``}://${
  isDocker() ? `www.starfish.cool` : `localhost`
}:4200`

let client = socketIo(serverUrl, { secure: true })
c.log(
  `Attempting to connect to game server at ${serverUrl}`,
)
export const io: Socket<IOServerEvents, IOClientEvents> =
  client.connect()

io.on(`connect`, () => {
  c.log(
    `green`,
    `Connected to game server at ${serverUrl}.`,
  )
})

io.on(`disconnect`, () => {
  c.log(`red`, `Lost connection to game server.`)
})

io.on(
  `ship:message`,
  async (
    id,
    message,
    channelType,
    notify = false,
    isGood = false,
  ) => {
    const guild = discordClient.guilds.cache.find(
      (g) => g.id === id,
    )
    if (!guild)
      return c.log(
        `red`,
        `Message came for a guild (${id}) that does not have the bot added on Discord:`,
        message,
      )

    enQueue({
      guild,
      channelType: channelType || `alert`,
      message:
        typeof message === `string`
          ? message
          : message
              .map((m: RichLogContentElement) => m.text)
              .join(` `),
      notify,
    })
  },
)

export function connected(): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (io.connected) {
      resolve(true)
      return
    }
    let timeout = 0
    while (timeout < 50) {
      // 5 seconds
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
