import { config as dotEnvConfig } from 'dotenv'
import * as cache from './models/cache'
import * as ship from './models/ship'
import * as attackRemnant from './models/attackRemnant'
import * as planet from './models/planet'
dotEnvConfig()

import c from '../../../common/dist'
import mongoose from 'mongoose'
export const db = {
  cache,
  ship,
  attackRemnant,
  planet,
}
let ready = false
const toRun: Function[] = []

export const isReady = () => ready
export const init = ({
  hostname = `mongodb`,
  port = 27017,
  dbName = `spacecord`,
  username = encodeURIComponent(
    process.env.MONGODB_ADMINUSERNAME!,
  ),
  password = encodeURIComponent(
    process.env.MONGODB_ADMINPASSWORD!,
  ),
}: {
  hostname?: string
  port?: number
  dbName?: string
  username?: string
  password?: string
}) => {
  return new Promise<void>(async (resolve) => {
    if (ready) resolve()

    const onReady = async () => {
      c.log(`green`, `Connection to db established.`)
      ready = true
      const promises = toRun.map(async (f) => await f())
      await Promise.all(promises)
      resolve()
    }

    if (mongoose.connection.readyState === 0) {
      const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`
      c.log(
        `gray`,
        `No existing db connection, creating...`,
      )

      mongoose
        .connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        })
        .catch(() => {})

      mongoose.connection.on(`error`, (error) =>
        c.log(`red`, error.message),
      )
      mongoose.connection.once(`open`, () => {
        onReady()
      })
    } else {
      onReady()
    }
  })
}

export const runOnReady = (f: Function) => {
  if (ready) f()
  else toRun.push(f)
}
