import c from '../../common/dist'

const lastCommit = require(`git-last-commit`)
lastCommit.getLastCommit((err, commit) => {
  c.log(
    `blue`,
    `Latest commit:`,
    commit?.subject,
    `(${new Date(
      parseInt(commit?.committedOn) * 1000,
    ).toLocaleString()})`,
  )
})

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
  // await db.attackRemnant.wipe()
  // await db.planet.wipe()
  // await db.ship.wipe()
  // await db.cache.wipe()
  // await db.zone.wipe()
  // await db.ship.wipeAI()

  const savedGameData =
    await db.gameSettings.getAllConstructible()
  if (savedGameData && savedGameData[0]) {
    c.log(`Loaded game settings.`)
    game.setSettings(savedGameData[0])
  } else {
    c.log(`Starting game with default settings.`)
  }

  const savedPlanets = await db.planet.getAllConstructible()
  c.log(
    `Loaded ${savedPlanets.length} saved planets from DB.`,
  )
  for (let planet of savedPlanets)
    if (planet.planetType === `basic`)
      game.addBasicPlanet(
        planet as BaseBasicPlanetData,
        false,
      )
    else if (planet.planetType === `mining`)
      game.addMiningPlanet(
        planet as BaseMiningPlanetData,
        false,
      )

  const savedCaches = await db.cache.getAllConstructible()
  c.log(
    `Loaded ${savedCaches.length} saved caches from DB.`,
  )
  savedCaches.forEach((cache) =>
    game.addCache(cache, false),
  )

  const savedZones = await db.zone.getAllConstructible()
  c.log(`Loaded ${savedZones.length} saved zones from DB.`)
  savedZones.forEach((zone) => game.addZone(zone, false))

  const savedShips = await db.ship.getAllConstructible()
  c.log(
    `Loaded ${savedShips.length} saved ships (${
      savedShips.filter((s) => !s.ai).length
    } human) from DB.`,
  )
  // savedShips
  //   .filter((s) => !s.ai)
  //   .forEach((s) => c.log(s.id, s.name, s.items, s.chassis))
  for (let ship of savedShips) {
    if (ship.ai) game.addAIShip(ship, false)
    else game.addHumanShip(ship as BaseHumanShipData, false)
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
