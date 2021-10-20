import c from '../../../../common/dist'
import { Socket } from 'socket.io'
import fs from 'fs'

import { getBackups, resetDbToBackup } from '../../db'

import type { Game } from '../../game/Game'
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

if (process.env.NODE_ENV === `production`) {
  try {
    adminKeys = JSON.parse(adminKeys)
  } catch (e) {
    adminKeys = false
    c.log(`red`, `Error loading admin keys!`, e)
  }
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
  game: Game,
) {
  socket.on(`game:adminCheck`, (id, password, callback) => {
    if (!game) return
    return callback(isAdmin(id, password))
  })

  socket.on(`admin:map`, (id, password, callback) => {
    if (!game) return
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:map`,
      )
    return callback({ data: game.toAdminMapData() })
  })

  socket.on(
    `game:setSettings`,
    (id, password, newSettings) => {
      if (!game) return
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:setSettings`,
        )
      c.log(`Game settings updated:`, newSettings)
      game.setSettings(newSettings)
    },
  )

  socket.on(`admin:respawnShip`, (id, password, shipId) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:respawnShip`,
      )
    game.humanShips
      .find((s) => s.id === shipId)
      ?.respawn(true)
  })

  socket.on(`admin:deleteShip`, (id, password, shipId) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access admin:deleteShip`,
      )
    game.removeShip(shipId)
  })

  socket.on(
    `admin:achievementToShip`,
    (id, password, shipId, achievement) => {
      if (!game) return
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
      if (!game) return
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
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:save`,
      )
    game.save()
  })

  socket.on(`game:pause`, (id, password) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:pause`,
      )
    game.paused = true
    c.log(`yellow`, `Game paused`)
  })

  socket.on(`game:unpause`, (id, password) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:unpause`,
      )
    game.paused = false
    c.log(`yellow`, `Game unpaused`)
  })

  socket.on(`game:backups`, (id, password, callback) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:backups`,
      )
    callback({ data: getBackups() })
  })
  socket.on(
    `game:resetToBackup`,
    (id, password, backupId) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetToBackup`,
        )
      resetDbToBackup(backupId)
    },
  )

  socket.on(`game:messageAll`, (id, password, message) => {
    if (!game) return
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
      if (!game) return
      s.logEntry(message, `critical`)
    })
  })

  socket.on(
    `game:resetAllPlanets`,
    async (id, password) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetAllPlanets`,
        )
      c.log(`Admin resetting all planets`)
      while (game.planets.length)
        await game.removePlanet(game.planets[0])
    },
  )

  socket.on(`game:resetAllComets`, async (id, password) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllComets`,
      )
    c.log(`Admin resetting all comets`)
    while (game.comets.length)
      await game.removePlanet(game.comets[0])
  })

  socket.on(
    `game:reLevelAllPlanets`,
    async (id, password) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:reLevelAllPlanets`,
        )
      c.log(`Admin releveling all planets`)
      game.planets.forEach((p) => p.resetLevels())
    },
  )
  socket.on(
    `game:reLevelAllPlanetsOfType`,
    async (id, password, type) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:reLevelAllPlanetsOfType`,
        )
      c.log(`Admin releveling ${type} planets`)
      game.planets
        .filter((p) => p.planetType === type)
        .forEach((p) => p.resetLevels())
    },
  )
  socket.on(
    `game:reLevelOnePlanet`,
    async (id, password, planetId) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:reLevelOnePlanet`,
        )
      const planet = game.planets.find(
        (p) => p.id === planetId,
      )
      if (!planet) return
      c.log(`Admin releveling planet ${planet.name}`)
      planet.resetLevels(true)
    },
  )

  socket.on(
    `game:levelUpOnePlanet`,
    async (id, password, planetId) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:levelUpOnePlanet`,
        )
      const planet = game.planets.find(
        (p) => p.id === planetId,
      )
      if (!planet) return
      c.log(`Admin leveling planet ${planet.name}`)
      planet.levelUp()
    },
  )

  socket.on(
    `admin:give`,
    async (id, password, shipId, cargo) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access admin:give`,
        )
      const ship = game.humanShips.find(
        (p) => p.id === shipId,
      )
      if (!ship) return
      c.log(
        `Admin giving cargo ${JSON.stringify(
          cargo,
        )} to ship ${ship.name}`,
      )
      ship.distributeCargoAmongCrew(cargo)
    },
  )

  socket.on(
    `game:resetHomeworlds`,
    async (id, password) => {
      if (!game) return
      if (!isAdmin(id, password))
        return c.log(
          `Non-admin attempted to access game:resetHomeworlds`,
        )
      c.log(`Admin resetting homeworlds`)
      game.resetHomeworlds()
    },
  )

  socket.on(`game:resetAllZones`, async (id, password) => {
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllZones`,
      )
    c.log(`Admin resetting all zones`)
    while (game.zones.length)
      await game.removeZone(game.zones[0])
  })

  socket.on(`game:resetAllCaches`, async (id, password) => {
    if (!game) return
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
      if (!game) return
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
      if (!game) return
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
    if (!game) return
    if (!isAdmin(id, password))
      return c.log(
        `Non-admin attempted to access game:resetAllShips`,
      )
    c.log(`Admin resetting all ships`)
    for (let ship of game.ships) {
      await game.removeShip(ship)
    }
    while (game.ships.length)
      await game.removeShip(game.ships[0])
  })

  socket.on(
    `game:shipList`,
    async (id, password, humanOnly, callback) => {
      if (!game) return
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

  socket.on(
    `admin:move`,
    async (
      userId,
      password,
      type,
      id,
      location,
      callback,
    ) => {
      if (!game) return
      if (!isAdmin(userId, password))
        return c.log(
          `Non-admin attempted to access admin:move`,
        )
      if (type === `ship`) {
        const found = game.ships.find((s) => s.id === id)
        if (found) {
          found.move(location)
          c.log(`Moved ship`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `planet`) {
        const found = game.planets.find((s) => s.id === id)
        if (found) {
          const previousLocation = [
            ...found.location,
          ] as CoordinatePair
          found.location = location
          found.toUpdate.location = found.location
          game.chunkManager.addOrUpdate(
            found,
            previousLocation,
          )
          c.log(`Moved planet`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `comet`) {
        const found = game.comets.find((s) => s.id === id)
        if (found) {
          const previousLocation = [
            ...found.location,
          ] as CoordinatePair
          found.location = location
          found.toUpdate.location = found.location
          game.chunkManager.addOrUpdate(
            found,
            previousLocation,
          )
          c.log(`Moved comet`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `zone`) {
        const found = game.zones.find((s) => s.id === id)
        if (found) {
          const previousLocation = [
            ...found.location,
          ] as CoordinatePair
          found.location = location
          found._stub = null
          game.chunkManager.addOrUpdate(
            found,
            previousLocation,
          )
          c.log(`Moved zone`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `cache`) {
        const found = game.caches.find((s) => s.id === id)
        if (found) {
          const previousLocation = [
            ...found.location,
          ] as CoordinatePair
          c.log(found.location)
          found.location = location
          found._stub = null
          c.log(found.location)
          game.chunkManager.addOrUpdate(
            found,
            previousLocation,
          )
          c.log(`Moved cache`, found.id)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      return (
        typeof callback === `function` &&
        callback({ error: `Nothing found to move.` })
      )
    },
  )

  socket.on(
    `admin:delete`,
    async (userId, password, type, id, callback) => {
      if (!game) return
      if (!isAdmin(userId, password))
        return c.log(
          `Non-admin attempted to access admin:delete`,
        )
      if (type === `ship`) {
        const found = game.ships.find((s) => s.id === id)
        if (found) {
          game.removeShip(found)
          c.log(`Deleted ship`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `planet`) {
        const found = game.planets.find((s) => s.id === id)
        if (found) {
          game.removePlanet(found)
          c.log(`Deleted planet`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `comet`) {
        const found = game.comets.find((s) => s.id === id)
        if (found) {
          game.removePlanet(found)
          c.log(`Deleted comet`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `zone`) {
        const found = game.zones.find((s) => s.id === id)
        if (found) {
          game.removeZone(found)
          c.log(`Deleted zone`, found.name)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      if (type === `cache`) {
        const found = game.caches.find((s) => s.id === id)
        if (found) {
          game.removeCache(found)
          c.log(`Deleted cache`, found.id)
          return (
            typeof callback === `function` &&
            callback({ data: true })
          )
        }
      }
      return (
        typeof callback === `function` &&
        callback({ error: `Nothing found to delete.` })
      )
    },
  )
}
