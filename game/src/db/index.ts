import { exec } from 'child_process'
import { config as dotEnvConfig } from 'dotenv'
import * as fs from 'fs'
import isDocker from 'is-docker'
import mongoose from 'mongoose'
import path from 'path'
import c from '../../../common/dist'
import * as attackRemnant from './models/attackRemnant'
import * as cache from './models/cache'
import * as game from './models/game'
import * as gameSettings from './models/gameSettings'
import * as planet from './models/planet'
import * as ship from './models/ship'
import * as zone from './models/zone'
dotEnvConfig()

export const db = {
  cache,
  ship,
  attackRemnant,
  planet,
  zone,
  gameSettings,
  game,
}
let ready = false

const minBackupInterval = 1000 * 60 * 60 * 3 // hours
const maxBackups = 60

let databaseName: string
let mongoUsername: string
let mongoPassword: string

try {
  mongoUsername = fs
    .readFileSync(`/run/secrets/mongodb_username`, `utf-8`)
    .trim()
} catch (e) {
  mongoUsername =
    process.env.NODE_ENV === `ci`
      ? `testuser`
      : (process.env.MONGODB_ADMINUSERNAME as string)
}
try {
  mongoPassword = fs
    .readFileSync(`/run/secrets/mongodb_password`, `utf-8`)
    .trim()
} catch (e) {
  mongoPassword =
    process.env.NODE_ENV === `ci`
      ? `testpassword`
      : (process.env.MONGODB_ADMINPASSWORD as string)
}

databaseName = process.env.NODE_ENV === `ci` ? `starfish-test` : `starfish`
// c.log({ databaseName, mongoUsername, mongoPassword })

const defaultMongoOptions: GameDbOptions = {
  hostname: isDocker() ? `mongodb` : `localhost`,
  port: 27017,
  dbName: databaseName,
  username: mongoUsername,
  password: mongoPassword,
  authDatabase: `starfish`,
}

let toRun: Function[] = []

export const isReady = () => ready
export const init = ({
  hostname = isDocker() ? `mongodb` : `localhost`,
  port = 27017,
  dbName = databaseName,
  username = mongoUsername,
  password = mongoPassword,
}: GameDbOptions) => {
  return new Promise<void>(async (resolve) => {
    if (ready) resolve()

    const onReady = async () => {
      c.log(`green`, `Connection to db established.`)
      ready = true
      const promises = toRun.map(async (f) => {
        await f()
      })
      toRun = []
      await Promise.all(promises)
      startDbBackupInterval()
      resolve()
    }

    if (mongoose.connection.readyState === 0) {
      const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`
      // c.log(uri)
      c.log(`gray`, `No existing db connection, creating...`)
      ;(
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        } as any) as any
      ).catch(() => {})

      mongoose.connection.on(`error`, (error) => c.log(`red`, error.message))
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

function startDbBackupInterval() {
  backUpDb()
  setInterval(backUpDb, minBackupInterval)
}

const backupsFolderPath = path.resolve(
  isDocker()
    ? path.resolve(`/usr/app/game/db_volume`)
    : path.resolve(__dirname, `../../../`, `db/`),
  `backups/`,
)

export function backUpDb(force?: true): Promise<void | true> {
  return new Promise(async (resolve) => {
    try {
      if (!fs.existsSync(backupsFolderPath)) fs.mkdirSync(backupsFolderPath)
    } catch (e) {
      c.log(`red`, `Could not create backups folder:`, backupsFolderPath, e)
      resolve()
      return
    }

    fs.readdir(backupsFolderPath, (err, backups) => {
      if (err) {
        resolve()
        return
      }
      const sortedBackups = backups
        .filter((p) => p.indexOf(`.`) !== 0)
        .sort((a, b) => {
          const aDate = new Date(parseInt(a))
          const bDate = new Date(parseInt(b))
          return bDate.getTime() - aDate.getTime()
        })
      const mostRecentBackup = sortedBackups[0]

      while (sortedBackups.length > maxBackups) {
        const oldestBackup = sortedBackups[sortedBackups.length - 1]
        sortedBackups.splice(sortedBackups.length - 1, 1)
        fs.rmSync(path.resolve(backupsFolderPath, oldestBackup), {
          recursive: true,
        })
      }

      if (
        force ||
        !mostRecentBackup ||
        new Date(parseInt(mostRecentBackup)).getTime() <
          Date.now() - minBackupInterval
      ) {
        c.log(`gray`, `Backing up db...`)

        const backupName = Date.now()

        let cmd =
          `mongodump --host ` +
          defaultMongoOptions.hostname +
          ` --port ` +
          defaultMongoOptions.port +
          ` --db ` +
          defaultMongoOptions.dbName +
          ` --username ` +
          defaultMongoOptions.username +
          ` --password ` +
          defaultMongoOptions.password +
          ` --out ` +
          path.resolve(backupsFolderPath, `${backupName}`)

        exec(cmd, undefined, (error, stdout, stderr) => {
          if (error) {
            c.log({ error })
            resolve()
          } else resolve(true)
        })
      }
    })
  })
}

export function getBackups() {
  try {
    return fs.readdirSync(backupsFolderPath).filter((p) => p.indexOf(`.`) !== 0)
  } catch (e) {
    c.log(`red`, `Could not find backups folder:`, backupsFolderPath)
    return []
  }
}

export function resetDbToBackup(backupId: string) {
  return new Promise<true | string>(async (resolve) => {
    try {
      if (
        !fs.existsSync(backupsFolderPath) ||
        !fs.existsSync(path.resolve(backupsFolderPath, backupId))
      ) {
        resolve(`Attempted to reset db to nonexistent backup`)
        return
      }
    } catch (e) {
      resolve(`Unable to find db backups folder`)
      return
    }

    c.log(`yellow`, `Resetting db to backup`, backupId)

    let cmd =
      `mongorestore --drop --verbose --host="` +
      defaultMongoOptions.hostname +
      `" --port ` +
      defaultMongoOptions.port +
      ` --username ` +
      defaultMongoOptions.username +
      ` --password ` +
      defaultMongoOptions.password +
      ` --authenticationDatabase ` +
      defaultMongoOptions.authDatabase +
      ` ` +
      path.resolve(backupsFolderPath, backupId)

    exec(cmd, undefined, (error, stdout, stderr) => {
      if (error) {
        resolve(error.message)
      }

      c.log(stdout)
      c.log({ stderr })
      resolve(true)
    })
  })
}
