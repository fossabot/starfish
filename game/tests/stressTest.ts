import c from '../../common/dist'
import { Game } from '../src/game/Game'
import { crewMemberData, enemyAiShipData, humanShipData } from './defaults'

async function stressTest() {
  const log = console.log
  console.log = () => {}

  const output: {
    humanShips: number
    aiShips: number
    crewMembers: number
    planets: number
    zones: number
    time: number
    comment?: string
  }[] = []

  const tickCount = 20
  const crewMemberCount = 10

  for (let humanCount of [1, 10, 100, 200, 500]) {
    log(`starting human:`, humanCount)
    const g = new Game()
    for (let i = 0; i < humanCount; i++) {
      const s = await g.addHumanShip({
        ...humanShipData(),
        location: [c.randomBetween(-5, 5), c.randomBetween(-5, 5)],
        velocity: [
          c.randomBetween(-0.0001, 0.0001),
          c.randomBetween(-0.0001, 0.0001),
        ],
      })
      for (let m = 0; m < crewMemberCount; m++) {
        const cm = await s.addCrewMember(crewMemberData(), true)
        cm.goTo(c.randomFromArray([`cockpit`, `weapons`, `repair`, `lab`]))
      }
    }
    await g.tick(false)
    await c.sleep(1)

    c.massProfiler.fullReset()

    const totals: number[] = []
    log(`ticking ${tickCount} times...`)
    for (let i = 0; i < tickCount; i++) {
      const start = performance.now()
      await g.tick(false)
      const end = performance.now()

      totals.push(end - start)
    }

    const time = totals.reduce((a, b) => a + b, 0) / totals.length

    console.log = log
    c.massProfiler.print()
    console.log = () => {}

    output.push({
      humanShips: g.humanShips.length,
      aiShips: g.aiShips.length,
      crewMembers: crewMemberCount * g.humanShips.length,
      planets: g.planets.length,
      zones: g.zones.length,
      time,
      comment: ``,
    })
  }

  for (let aiCount of [100, 500, 1000, 2000]) {
    log(`starting ai:`, aiCount)
    const g = new Game()
    for (let i = 0; i < aiCount; i++) {
      const s = await g.addAIShip({
        ...enemyAiShipData(),
        location: [c.randomBetween(-5, 5), c.randomBetween(-5, 5)],
        velocity: [
          c.randomBetween(-0.0001, 0.0001),
          c.randomBetween(-0.0001, 0.0001),
        ],
      })
    }
    await g.tick(false)
    await c.sleep(1)

    c.massProfiler.fullReset()

    const totals: number[] = []
    log(`ticking ${tickCount} times...`)
    for (let i = 0; i < tickCount; i++) {
      const start = performance.now()
      await g.tick(false)
      const end = performance.now()

      totals.push(end - start)
    }

    const time = totals.reduce((a, b) => a + b, 0) / totals.length

    console.log = log
    c.massProfiler.print()
    console.log = () => {}

    output.push({
      humanShips: g.humanShips.length,
      aiShips: g.aiShips.length,
      crewMembers: crewMemberCount * g.humanShips.length,
      planets: g.planets.length,
      zones: g.zones.length,
      time,
      comment: ``,
    })
  }

  log(
    output
      .map(
        (o) =>
          `${o.aiShips} ai ships, ${o.humanShips} human ships (${
            o.crewMembers
          } crew members), ${o.planets} planets, ${o.zones} zones: ${c.r2(
            o.time,
          )}ms to tick ${o.comment}`,
      )
      .join(`\n`),
  )

  log(`done!`)
}

stressTest()
