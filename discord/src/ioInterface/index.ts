import c from '../../../common/dist'
import socketIo, { Socket } from 'socket.io-client'

// connect to server
const client = socketIo(`http://game:4200`)
export const io: Socket<IOServerEvents, IOClientEvents> =
  client.connect()

io.on(`connect`, () => {
  c.log(`green`, `Connected to game server.`)
})

io.on(`disconnect`, () => {
  c.log(`red`, `Lost connection to game server.`)
})

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

import * as ship from './ship'

export default {
  connected,
  ship,
}
