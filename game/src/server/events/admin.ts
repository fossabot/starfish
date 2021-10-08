import c from '../../../../common/dist'
import { Socket } from 'socket.io'
import fs from 'fs'

import { db, getBackups, resetDbToBackup } from '../../db'

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

  socket.on(`admin:map`, (id, password, callback) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:map`,
      )
    return callback({ data: game.toAdminMapData() })
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
    `admin:achievementToShip`,
    (id, password, shipId, achievement) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access admin:achievementToShip`,
        )
      const ship = game.humanShips.find(
        (s) => s.id === shipId,
      )
      if (!ship) return
      ship.addAchievement(achievement)
      c.log(
        `Achievement added to ship ${ship.name}:`,
        achievement,
      )
    },
  )

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

  socket.on(`game:backups`, (id, password, callback) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:backups`,
      )
    callback({ data: getBackups() })
  })
  socket.on(
    `game:resetToBackup`,
    (id, password, backupId) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetToBackup`,
        )
      resetDbToBackup(backupId)
    },
  )

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
      while (game.planets.length)
        await game.removePlanet(game.planets[0])
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
    while (game.zones.length)
      await game.removeZone(game.zones[0])
  })

  socket.on(`game:resetAllCaches`, async (id, password) => {
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllCaches`,
      )
    c.log(`Admin resetting all caches`)
    while (game.caches.length)
      await game.removeCache(game.caches[0])
  })

  socket.on(
    `game:resetAllAttackRemnants`,
    async (id, password) => {
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetAllAttackRemnants`,
        )
      c.log(`Admin resetting all attack remnants`)
      while (game.attackRemnants.length)
        await game.removeAttackRemnant(
          game.attackRemnants[0],
        )
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
    while (game.ships.length)
      await game.removeShip(game.ships[0])
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
