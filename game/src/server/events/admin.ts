import c from '../../../../common/dist'
import { Socket } from 'socket.io'
import fs from 'fs'

import { db } from '../../db'

import { game } from '../..'

let adminKeys: any
try {
  adminKeys = fs
    .readFileSync(
      process.env.ADMIN_KEYS_FILE as string,
      `utf-8`,
    )
    .trim()
} catch (e) {
  adminKeys = ``
}

try {
  adminKeys = JSON.parse(adminKeys)
} catch (e) {
  adminKeys = false
  c.log(`red`, `Error loading admin keys!`, e)
}

function isAdmin(id, password) {
  if (!adminKeys) return false
  if (password !== adminKeys?.password) return false
  if (!adminKeys?.validIds?.includes(id)) return false
  return true
}

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`game:adminCheck`, (id, password, callback) => {
    return callback(isAdmin(id, password))
  })

  socket.on(`game:save`, (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:save`,
      )
    game.save()
  })

  socket.on(`game:pause`, (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:pause`,
      )
    game.paused = true
    c.log(`yellow`, `Game paused`)
  })

  socket.on(`game:unpause`, (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:unpause`,
      )
    game.paused = false
    c.log(`yellow`, `Game unpaused`)
  })

  socket.on(`game:messageAll`, (id, password, message) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:messageAll`,
      )

    if (Array.isArray(message))
      message.unshift({
        color: `#888`,
        text: `Message from game admin:`,
      })
    else
      message = [
        {
          color: `#888`,
          text: `Message from game admin:`,
        },
        message,
      ]
    game.humanShips.forEach((s) => {
      s.logEntry(message, `critical`)
    })
  })

  socket.on(
    `game:resetAllPlanets`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetAllPlanets`,
        )
      c.log(`Admin resetting all planets`)
      await db.planet.wipe()
      while (game.planets.length) game.planets.pop()
    },
  )

  socket.on(`game:resetAllZones`, async (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllZones`,
      )
    c.log(`Admin resetting all zones`)
    await db.zone.wipe()
    while (game.zones.length) game.zones.pop()
  })

  socket.on(`game:resetAllCaches`, async (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllCaches`,
      )
    c.log(`Admin resetting all caches`)
    await db.cache.wipe()
    while (game.caches.length) game.caches.pop()
  })

  socket.on(
    `game:resetAllAttackRemnants`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetAllAttackRemnants`,
        )
      c.log(`Admin resetting all attack remnants`)
      await db.attackRemnant.wipe()
      while (game.attackRemnants.length)
        game.attackRemnants.pop()
    },
  )

  socket.on(
    `game:resetAllAIShips`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetAllAIShips`,
        )
      c.log(`Admin resetting all AI ships`)
      await db.ship.wipeAI()
      game.ships.forEach((ship) => {
        if (ship.ai)
          game.ships.splice(
            game.ships.findIndex((s) => s === ship),
            1,
          )
      })
    },
  )

  socket.on(`game:resetAllShips`, async (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllShips`,
      )
    c.log(`Admin resetting all ships`)
    await db.ship.wipe()
    while (game.ships.length) game.ships.pop()
  })
}
