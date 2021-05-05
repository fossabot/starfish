import { config as dotEnvConfig } from 'dotenv'
dotEnvConfig({ path: `../.env` })

import c from '../../common/dist'
import io from './ioInterface'
import * as discord from './discordClient'

async function start() {
  await discord.awaitLogin().catch((e) => c.log(`red`, e))
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
      })
    )?.name,
  )
  c.log(
    await io.ship.thrust({
      id: `456`,
      angle: 45,
      powerPercent: 1,
    }),
  )
}

start()
