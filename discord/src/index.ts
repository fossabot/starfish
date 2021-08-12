import { config as dotEnvConfig } from 'dotenv'
dotEnvConfig()

import c from '../../common/dist'
import io from './ioInterface'
import * as discord from './discordClient'

async function start() {
  if (!(await discord.connected())) {
    c.log(`red`, `Failed to connect to discord`)
    return
  }
  if (!(await io.connected())) {
    c.log(`red`, `Failed to connect to game server`)
  }
}

start()