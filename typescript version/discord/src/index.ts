import { config as dotEnvConfig } from 'dotenv'
dotEnvConfig({ path: `../.env` })

import c from '../../common/dist'
import io from './ioInterface'
import * as discord from './discordClient'

async function start() {
  if (!(await discord.connected())) {
    c.log('red', 'Failed to connect to discord')
    return
  }
  if (!(await io.connected())) {
    c.log('red', 'Failed to connect to game server')
    return
  }
  c.log((await io.ship.get(`123`))?.name)
  c.log(
    (
      await io.ship.create({
        id: `456`,
        name: `human2`,
        crewMembers: [],
        planet: 'Origin',
      })
    )?.name,
  )
}

start()
