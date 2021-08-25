import { config as dotEnvConfig } from 'dotenv'
import isDocker from 'is-docker'
import * as fs from 'fs'
import * as cache from './models/cache'
import * as ship from './models/ship'
import * as attackRemnant from './models/attackRemnant'
import * as planet from './models/planet'
import * as zone from './models/zone'
dotEnvConfig()

import c from '../../../common/dist'
const mongoose = require('mongoose')
export const db = {
  cache,
  ship,
  attackRemnant,
  planet,
  zone,
}
let ready = false

let mongoUsername: string
let mongoPassword: string

try {
  mongoUsername = fs.readFileSync(
    `/run/secrets/mongodb_username`,
    `utf-8`,
  ).trim()
} catch (e) {
  mongoUsername = process.env
    .MONGODB_ADMINUSERNAME as string
}
try {
  mongoPassword = fs.readFileSync(
    `/run/secrets/mongodb_password`,
    `utf-8`,
  ).trim()
} catch (e) {
  mongoPassword = process.env
    .MONGODB_ADMINPASSWORD as string
}
// c.log({ mongoUsername, mongoPassword })

const toRun: Function[] = []

export const isReady = () => ready
export const init = ({
  hostname = isDocker() ? `mongodb` : `localhost`,
  port = 27017,
  dbName = `starfish`,
  username = mongoUsername,
  password = mongoPassword,
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
      // c.log(uri)
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
