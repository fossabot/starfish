import c from '../../../common/dist'
import socketIo, { Socket } from 'socket.io-client'

// connect to server
const client = socketIo(`http://localhost:4200/discord`)
export const io: Socket<
  IOServerEvents,
  IOClientEvents
> = client.connect()

io.on(`connect`, () => {
  c.log(`Connected to socket.`)
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
      `Attempted to access io before socket was connected.`,
    )
    resolve(false)
  })
}

import * as ship from './ship'

export default {
  connected,
  ship,
}
