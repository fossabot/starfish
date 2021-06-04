import c from '../../common/dist'
import { Game } from './game/Game'
import './server/io'
import {
  db,
  init as dbInit,
  runOnReady as runOnDbReady,
} from './db'

dbInit({})

export const game = new Game()

runOnDbReady(async () => {
  await db.attackRemnant.wipe()
  // await db.planet.wipe()
  // await db.ship.wipe()
  // await db.cache.wipe()
  // await db.ship.wipeAI()

  const savedPlanets = await db.planet.getAllConstructible()
  c.log(
    `Loaded ${savedPlanets.length} saved planets from DB.`,
  )
  for (let planet of savedPlanets)
    game.addPlanet(planet as BasePlanetData, false)

  const savedCaches = await db.cache.getAllConstructible()
  c.log(
    `Loaded ${savedCaches.length} saved caches from DB.`,
  )
  savedCaches.forEach((cache) =>
    game.addCache(cache, false),
  )

  const savedShips = await db.ship.getAllConstructible()
  c.log(`Loaded ${savedShips.length} saved ships from DB.`)
  for (let ship of savedShips) {
    if (ship.ai) game.addAIShip(ship, false)
    else game.addHumanShip(ship as BaseHumanShipData)
  }

  const savedAttackRemnants =
    await db.attackRemnant.getAllConstructible()
  c.log(
    `Loaded ${game.attackRemnants.length} saved attack remnants from DB.`,
  )
  savedAttackRemnants.forEach((ar) =>
    game.addAttackRemnant(ar, false),
  )

  game.startGame()
})
