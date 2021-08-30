import c from '../../../../common/dist'
import type { Faction } from '../classes/Faction'
import type { Planet } from '../classes/Planet'
import type { Game } from '../Game'
import type { Ship } from '../classes/Ship/Ship'
import type { Zone } from '../classes/Zone'

export function generateZoneData(
  game: Game,
): BaseZoneData | false {
  let radius = (Math.random() + 0.15) * 0.2

  let locationSearchRadius = game.gameSoftRadius * 0.75
  const tooClose = radius * 3
  let location: CoordinatePair = [0, 0]
  const isTooClose = (p: Planet | Ship | Zone) =>
    c.distance(location, p.location) < tooClose
  // const getClosestPlanet = (closest: Planet, p: Planet) =>
  //   c.distance(p.location, location) <
  //   c.distance(closest?.location || [0, 0], location)
  //     ? p
  //     : closest
  while (
    game.planets.find(isTooClose) ||
    game.zones.find(isTooClose) ||
    game.humanShips.find(isTooClose)
  ) {
    location = c.randomInsideCircle(locationSearchRadius)
    locationSearchRadius *= 1.01
  }

  const color = `hsl(${Math.random() * 360}, ${Math.round(
    Math.random() * 80 + 20,
  )}%, ${Math.round(Math.random() * 40) + 45}%)`

  const weightedTypes: {
    value: ZoneEffectType
    weight: number
  }[] = [
    { value: `accelerate`, weight: 2 },
    { value: `decelerate`, weight: 2 },
    { value: `damage over time`, weight: 5 },
    { value: `repair over time`, weight: 1 },
    { value: `wormhole`, weight: 0.5 },
  ]
  const type =
    c.randomWithWeights(weightedTypes) || `damage over time`

  let name
  const effects: ZoneEffect[] = []
  if (type === `damage over time`) {
    name = c.randomFromArray(dotZoneNames)
    effects.push({
      type: `damage over time`,
      intensity: Math.min(1, Math.random() + 0.03),
      procChancePerTick: Math.random() * 0.001,
      dodgeable: true,
    })
    radius *= 2.5
  } else if (type === `repair over time`) {
    name = c.randomFromArray(healZoneNames)
    effects.push({
      type: `repair over time`,
      intensity: Math.random() * 0.01,
      procChancePerTick: 1,
    })
  } else if (type === `accelerate`) {
    name = c.randomFromArray(accelerateZoneNames)
    effects.push({
      type: `accelerate`,
      intensity: Math.random(),
      procChancePerTick: 1,
      basedOnProximity: c.coinFlip(),
    })
    radius *= 1.1
  } else if (type === `decelerate`) {
    name = c.randomFromArray(decelerateZoneNames)
    effects.push({
      type: `decelerate`,
      intensity: Math.random(),
      procChancePerTick: 1,
      basedOnProximity: c.coinFlip(),
    })
    radius *= 1.2
  } else if (type === `wormhole`) {
    name = c.randomFromArray(wormholeZoneNames)
    effects.push({
      type: `wormhole`,
      intensity: 1,
      procChancePerTick: 1,
    })
    radius *= 0.1
  }

  if (!name) return false

  return {
    id: `zone${`${Math.random()}`.substring(2)}`,
    name,
    color,
    radius,
    location,
    effects,
  }
}

const dotZoneNames = [
  `Ripping Field`,
  `Asteroid Field`,
  `Asteroid Belt`,
  `Debris Field`,
  `Radiation Zone`,
  `Minefield`,
  `Shredder Swarm`,
  `Gamma Cloud`,
  `Planetary Remains`,
  // todo MORE
]
const healZoneNames = [
  `Astral Oasis`,
  `Nanorepair Swarm`,
  // todo MORE
]
const accelerateZoneNames = [
  `Gravity Slingshot`,
  `Overcharge Field`,
  `Gravitational Anomaly`,
  `Boost Zone`,
  // todo MORE
]
const decelerateZoneNames = [
  `Magnesis Field`,
  `Gravity Well`,
  `Murky Nebula`,
  `Stifling Zone`,
  // todo MORE
]
const wormholeZoneNames = [
  `Wormhole`,
  `Universe Flux Point`,
  // todo MORE
]
