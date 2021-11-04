import c from '../../../../common/dist'
import type { Planet } from '../classes/Planet/Planet'
import type { Game } from '../Game'
import type { Ship } from '../classes/Ship/Ship'
import type { Zone } from '../classes/Zone'

function getName(game?: Game) {
  let name: string | undefined
  while (!name) {
    name = ``
    // if (Math.random() < 0.2)
    name += `${c.randomFromArray(cometNamePrefixes)} `

    name += c.randomFromArray(Array.from(cometNames))

    if (Math.random() < 0.1)
      name += `${c.randomFromArray(cometNameSuffixes)}`

    if (game?.comets.find((p) => p.name === name))
      name = undefined
  }
  return name
}

export function generateComet(
  game?: Game,
): BaseCometData | false {
  const name = getName(game)
  if (!name) return false

  const location = c
    .degreesToUnitVector(Math.random() * 360)
    .map(
      (v) => v * (game?.gameSoftRadius || 1) * 1.1,
    ) as CoordinatePair
  const initialSpeed =
    (c.getThrustMagnitudeForSingleCrewMember(
      20,
      2,
      game?.settings.baseEngineThrustMultiplier ||
        c.defaultGameSettings.baseEngineThrustMultiplier,
    ) *
      c.randomBetween(25, 400)) /
    60 /
    60 /
    c.tickInterval // au/hr
  const randomPointWithinUniverse = c.randomInsideCircle(
    game?.gameSoftRadius || 1,
  )
  const initialAngle = c.angleFromAToB(
    location,
    randomPointWithinUniverse,
  )
  const velocity = c
    .degreesToUnitVector(initialAngle)
    .map((v) => v * initialSpeed) as CoordinatePair

  const baseLevel = Math.ceil(Math.random() * 3)

  const color = `hsl(${Math.round(
    Math.random() * 360,
  )}, ${Math.round(Math.random() * 10 + 90)}%, ${
    Math.round(Math.random() * 50) + 30
  }%)`

  const radius = Math.floor(Math.random() * 10000 + 5000)
  const mass =
    1000 *
    200 * // 200 tons
    (1 + 0.2 * (Math.random() - 0.5))

  return {
    planetType: `comet`,
    pacifist: false,
    id: `comet` + `${Math.random()}`.slice(2),
    name,
    location,
    velocity,
    color,
    level: 0,
    xp: 0,
    baseLevel,
    creatures: [],
    radius,
    mass,
    landingRadiusMultiplier: 2,
  }
}

const cometNames = new Set([`Comet`, `Meteoroid`])
const cometNamePrefixes = [
  `Halley's`,
  `Madsen's`,
  `Longino's`,
  `Sugita's`,
  `Rockow's`,
  `Aurore's`,
  `Anlong`,
  `Brooks`,
  `Denning's`,
  `Swift's`,
  `Schorr's`,
  `Kosai`,
  `Haneda's`,
  `Campos'`,
  `Lexell's`,
  `Alais`,
  `Allan`,
  `Bear Creek`,
  `Grant`,
  `Ilimac`,
  `Brenham`,
  `Claxton`,
  `Mineo`,
  `Mbozi`,
  `Nogata`,
  `Omolon`,
  `Minas`,
  `Sulagiri`,
  `Treysa`,
  `Wold`,
  `Zagami`,
]
const cometNameSuffixes = [
  ` Prime`,
  ` I`,
  ` II`,
  ` III`,
  ` IV`,
  ` V`,
  ` VI`,
  ` VII`,
  ` VIII`,
  ` X`,
  ` Alpha`,
  ` Beta`,
  ` Gamma`,
  ` Omega`,
]
