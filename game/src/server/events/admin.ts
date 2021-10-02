import c from '../../../../common/dist'
import { Socket } from 'socket.io'
import fs from 'fs'

import { db } from '../../db'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'

let adminKeys: any
try {
  adminKeys = fs
    .readFileSync(
      process.env.ADMIN_KEYS_FILE as string,
      `utf-8`,
    )
    .trim()
} catch (e) {
  try {
    adminKeys = fs
      .readFileSync(`/run/secrets/admin_keys`, `utf-8`)
      .trim()
  } catch (e) {
    adminKeys = ``
  }
}

try {
  adminKeys = JSON.parse(adminKeys)
} catch (e) {
  adminKeys = false
  c.log(`red`, `Error loading admin keys!`, e)
}

function isAdmin(id, password) {
  if (process.env.NODE_ENV === `development`) return true
  if (!adminKeys) return false
  if (password !== adminKeys?.password) {
    return false
  }
  if (!adminKeys?.allowedIds?.includes(id)) {
    return false
  }
  return true
}

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`game:adminCheck`, (id, password, callback) => {
    return callback(isAdmin(id, password))
  })

  socket.on(
    `game:setSettings`,
    (id, password, newSettings) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:setSettings`,
        )
      c.log(`Game settings updated:`, newSettings)
      game.setSettings(newSettings)
    },
  )

  socket.on(`admin:respawnShip`, (id, password, shipId) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:respawnShip`,
      )
    game.humanShips
      .find((s) => s.id === shipId)
      ?.respawn(true)
  })

  socket.on(`admin:deleteShip`, (id, password, shipId) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:deleteShip`,
      )
    game.removeShip(shipId)
  })

  socket.on(
    `admin:deleteCrewMember`,
    (id, password, shipId, crewMemberId) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access admin:deleteCrewMember`,
        )
      const foundShip = game.ships.find(
        (s) => s.id == shipId,
      )
      if (foundShip && `removeCrewMember` in foundShip)
        (foundShip as HumanShip).removeCrewMember(
          crewMemberId,
          true,
        )
    },
  )

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
      game.humanShips.forEach((s) => {
        while (s.seenPlanets.length) s.seenPlanets.pop()
        s.toUpdate.seenPlanets = []
      })
    },
  )

  socket.on(
    `game:reLevelAllPlanets`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:reLevelAllPlanets`,
        )
      c.log(`Admin releveling all planets`)
      game.planets.forEach((p) => p.resetLevels())
    },
  )

  socket.on(
    `game:resetHomeworlds`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetHomeworlds`,
        )
      c.log(`Admin resetting homeworlds`)
      game.resetHomeworlds()
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
    game.humanShips.forEach((s) => {
      while (s.seenLandmarks.length) s.seenLandmarks.pop()
      s.toUpdate.seenLandmarks = []
    })
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
      for (let ship of game.ships) {
        if (ship.ai) await game.removeShip(ship)
      }
      c.log(game.aiShips.length, `AI ships reset`)
      game.spawnNewAIs()
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

  socket.on(
    `game:shipList`,
    async (id, password, humanOnly, callback) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:shipList`,
        )
      callback({
        data: game.ships
          .filter((s) => (humanOnly ? s.human : true))
          .map((s) => ({
            name: s.name,
            id: s.id,
            guildId: s.guildId,
            crewMemberCount: s.crewMembers.length,
            isTutorial: s.tutorial
              ? s.tutorial.ship?.crewMembers[0]?.name ||
                `unknown crew member`
              : false,
          })),
      })
    },
  )
}
