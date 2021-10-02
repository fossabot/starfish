import { config as dotEnvConfig } from 'dotenv'
import isDocker from 'is-docker'
import * as fs from 'fs'
import * as cache from './models/cache'
import * as ship from './models/ship'
import * as attackRemnant from './models/attackRemnant'
import * as planet from './models/planet'
import * as zone from './models/zone'
import * as gameSettings from './models/gameSettings'
dotEnvConfig()

import c from '../../../common/dist'
import mongoose from 'mongoose'
import path from 'path/posix'
import { exec } from 'child_process'
export const db = {
  cache,
  ship,
  attackRemnant,
  planet,
  zone,
  gameSettings,
}
let ready = false

const minBackupInterval = 1000 * 60 * 60 * 12
const maxBackups = 20

let mongoUsername: string
let mongoPassword: string

try {
  mongoUsername = fs
    .readFileSync(`/run/secrets/mongodb_username`, `utf-8`)
    .trim()
} catch (e) {
  mongoUsername = process.env
    .MONGODB_ADMINUSERNAME as string
}
try {
  mongoPassword = fs
    .readFileSync(`/run/secrets/mongodb_password`, `utf-8`)
    .trim()
} catch (e) {
  mongoPassword = process.env
    .MONGODB_ADMINPASSWORD as string
}
// c.log({ mongoUsername, mongoPassword })

const defaultMongoOptions = {
  hostname: isDocker() ? `mongodb` : `localhost`,
  port: 27017,
  dbName: `starfish`,
  username: mongoUsername,
  password: mongoPassword,
}
const defaultUri = `mongodb://${defaultMongoOptions.username}:${defaultMongoOptions.password}@${defaultMongoOptions.hostname}:${defaultMongoOptions.port}/${defaultMongoOptions.dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`

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
      startDbBackupInterval()
      resolve()
    }

    if (mongoose.connection.readyState === 0) {
      const uri = `mongodb://${username}:${password}@${hostname}:${port}/${dbName}?poolSize=20&writeConcern=majority?connectTimeoutMS=5000`
      // c.log(uri)
      c.log(
        `gray`,
        `No existing db connection, creating...`,
      )
      ;(
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false,
        } as any) as any
      ).catch(() => {})

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

function startDbBackupInterval() {
  backUpDb()
  setInterval(backUpDb, minBackupInterval)
}

function backUpDb() {
  const dbFolderPath = path.resolve(
    __dirname,
    `../../../`,
    `db/`,
  )
  const backupsFolderPath = path.resolve(
    dbFolderPath,
    `backups/`,
  )

  try {
    if (!fs.existsSync(backupsFolderPath))
      fs.mkdirSync(backupsFolderPath)
  } catch (e) {}

  fs.readdir(backupsFolderPath, (err, backups) => {
    if (err) return
    const sortedBackups = backups
      .filter((p) => p.indexOf(`.`) !== 0)
      .sort((a, b) => {
        const aDate = new Date(parseInt(a))
        const bDate = new Date(parseInt(b))
        return bDate.getTime() - aDate.getTime()
      })
    const mostRecentBackup = sortedBackups[0]

    while (sortedBackups.length > maxBackups) {
      const oldestBackup =
        sortedBackups[sortedBackups.length - 1]
      sortedBackups.splice(sortedBackups.length - 1, 1)
      fs.rmSync(
        path.resolve(backupsFolderPath, oldestBackup),
        { recursive: true },
      )
    }

    if (
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
        }
      })

      // copyFolderRecursiveSync(
      //   path.resolve(dbFolderPath, `data`),
      //   path.resolve(backupsFolderPath, `${backupName}`),
      // )
    }
  })
}

// function copyFileSync(source, target) {
//   let targetFile = target

//   // If target is a directory, a new file with the same name will be created
//   if (fs.existsSync(target)) {
//     if (fs.lstatSync(target).isDirectory()) {
//       targetFile = path.join(target, path.basename(source))
//     }
//   }

//   fs.writeFileSync(targetFile, fs.readFileSync(source))
// }

// function copyFolderRecursiveSync(source, target) {
//   let files: string[] = []

//   // Check if folder needs to be created or integrated
//   let targetFolder = target
//   if (!fs.existsSync(targetFolder)) {
//     fs.mkdirSync(targetFolder)
//   }

//   // Copy
//   if (fs.lstatSync(source).isDirectory()) {
//     files = fs.readdirSync(source)
//     files.forEach((file) => {
//       let curSource = path.join(source, file)
//       if (fs.lstatSync(curSource).isDirectory()) {
//         copyFolderRecursiveSync(curSource, targetFolder)
//       } else {
//         copyFileSync(curSource, targetFolder)
//       }
//     })
//   }
// }

export function getBackups() {
  const backupsFolderPath = path.resolve(
    __dirname,
    `../../../`,
    `db/`,
    `backups/`,
  )

  try {
    return fs
      .readdirSync(backupsFolderPath)
      .filter((p) => p.indexOf(`.`) !== 0)
  } catch (e) {
    return []
  }
}
export function resetDbToBackup(backupId: string) {
  const dbFolderPath = path.resolve(
    __dirname,
    `../../../`,
    `db/`,
  )
  const backupsFolderPath = path.resolve(
    dbFolderPath,
    `backups/`,
  )

  if (
    !fs.existsSync(backupsFolderPath) ||
    !fs.existsSync(
      path.resolve(backupsFolderPath, backupId),
    )
  )
    return c.log(
      `red`,
      `Attempted to reset db to nonexistent backup`,
    )

  c.log(`yellow`, `Resetting db to backup`, backupId)

  let cmd = `mongorestore --drop ${path.resolve(
    backupsFolderPath,
    backupId,
  )}`

  exec(cmd, undefined, (error, stdout, stderr) => {
    if (error) {
      console.log({ error })
    }
    console.log({ stderr })

    process.exit()
  })

  // copyFolderRecursiveSync(
  //   path.resolve(backupsFolderPath, backupId),
  //   path.resolve(dbFolderPath, `data`),
  // )
}
