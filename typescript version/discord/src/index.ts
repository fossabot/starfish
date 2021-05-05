import { config as dotEnvConfig } from 'dotenv'
dotEnvConfig({ path: `../.env` })

import c from '../../common/dist'
import io from './ioInterface'
import { client, awaitLogin } from './discordClient'

async function start() {
  await awaitLogin().catch((e) => c.log(`red`, e))
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
