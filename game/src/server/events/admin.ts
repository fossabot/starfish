import c from '../../../../common/dist'
import { Socket } from 'socket.io'

import { db } from '../../db'

import { game } from '../..'
import type { HumanShip } from '../../game/classes/Ship/HumanShip'
import type { CrewMember } from '../../game/classes/CrewMember/CrewMember'
import type { CombatShip } from '../../game/classes/Ship/CombatShip'
import type { Planet } from '../../game/classes/Planet/Planet'
import type { BasicPlanet } from '../../game/classes/Planet/BasicPlanet'
import type { Ship } from '../../game/classes/Ship/Ship'

export default function (
  socket: Socket<IOClientEvents, IOServerEvents>,
) {
  socket.on(`game:save`, () => {
    game.save()
  })

  socket.on(`game:resetAllPlanets`, async () => {
    c.log(`Admin resetting all planets`)
    await db.planet.wipe()
    while (game.planets.length) game.planets.pop()
  })

  socket.on(`game:resetAllZones`, async () => {
    c.log(`Admin resetting all zones`)
    await db.zone.wipe()
    while (game.zones.length) game.zones.pop()
  })

  socket.on(`game:resetAllCaches`, async () => {
    c.log(`Admin resetting all caches`)
    await db.cache.wipe()
    while (game.caches.length) game.caches.pop()
  })

  socket.on(`game:resetAllAttackRemnants`, async () => {
    c.log(`Admin resetting all attack remnants`)
    await db.attackRemnant.wipe()
    while (game.attackRemnants.length)
      game.attackRemnants.pop()
  })

  socket.on(`game:resetAllAIShips`, async () => {
    c.log(`Admin resetting all AI ships`)
    await db.ship.wipeAI()
    game.ships.forEach((ship) => {
      if (ship.ai)
        game.ships.splice(
          game.ships.findIndex((s) => s === ship),
          1,
        )
    })
  })

  socket.on(`game:resetAllShips`, async () => {
    c.log(`Admin resetting all ships`)
    await db.ship.wipe()
    while (game.ships.length) game.ships.pop()
  })
}
