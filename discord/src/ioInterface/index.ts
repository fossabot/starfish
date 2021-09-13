import c from '../../../common/dist'
import socketIo, { Socket } from 'socket.io-client'
import { client as discordClient } from '../discordClient'
import resolveOrCreateChannel from '../discordClient/actions/resolveOrCreateChannel'
import isDocker from 'is-docker'

import * as ship from './ship'
import * as crew from './crew'

export default {
  connected,
  ship,
  crew,
}

// connect to server
const client = socketIo(
  `http${isDocker() ? `s` : ``}://${
    isDocker() ? `game` : `localhost`
  }:4200`,
  { secure: true, rejectUnauthorized: false },
)

export const io: Socket<IOServerEvents, IOClientEvents> =
  client.connect()

io.on(`connect`, () => {
  c.log(`green`, `Connected to game server.`)
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
