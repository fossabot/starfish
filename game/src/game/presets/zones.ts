import c from '../../../../common/dist'
import type { Planet } from '../classes/Planet/Planet'
import type { Game } from '../Game'
import type { Ship } from '../classes/Ship/Ship'
import type { Zone } from '../classes/Zone'

export function getValidZoneLocation(
  radius: number,
  game?: Game,
) {
  let locationSearchRadius =
    (game?.gameSoftRadius || 1) * 0.75
  const tooClose = radius * 3
  let location: CoordinatePair = c.randomInsideCircle(
    locationSearchRadius,
  )
  const isTooClose = (p: Planet | Ship | Zone) =>
    c.distance(location, p.location) < tooClose
  while (
    game?.planets.find(isTooClose) ||
    game?.zones.find(isTooClose) ||
    game?.humanShips.find(isTooClose)
  ) {
    location = c.randomInsideCircle(locationSearchRadius)
    locationSearchRadius *= 1.01
  }

  return location
}

export function generateZoneData(
  game?: Game,
): BaseZoneData | false {
  let radius = (Math.random() + 0.15) * 0.2

  const location = getValidZoneLocation(radius, game)

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
    { value: `stamina regeneration`, weight: 1 },
    { value: `wormhole`, weight: 0.5 },
  ]
  const type =
    c.randomWithWeights(weightedTypes) || `damage over time`

  let name
  const effects: ZoneEffect[] = []
  const minimumIntensity = 0.2
  const intensity =
    Math.random() * (1 - minimumIntensity) +
    minimumIntensity
  if (type === `damage over time`) {
    name = c.randomFromArray(dotZoneNames)
    effects.push({
      type: `damage over time`,
      intensity,
      procChancePerTick: Math.random() * 0.001,
      dodgeable: true,
    })
    radius *= 2.5
  } else if (type === `repair over time`) {
    name = c.randomFromArray(healZoneNames)
    effects.push({
      type: `repair over time`,
      intensity,
      procChancePerTick: 1,
    })
  } else if (type === `stamina regeneration`) {
    name = c.randomFromArray(staminaRegenZoneNames)
    effects.push({
      type: `stamina regeneration`,
      intensity,
      procChancePerTick: 1,
      basedOnProximity: c.coinFlip(),
    })
  } else if (type === `accelerate`) {
    name = c.randomFromArray(accelerateZoneNames)
    effects.push({
      type: `accelerate`,
      intensity,
      procChancePerTick: 1,
      basedOnProximity: c.coinFlip(),
    })
    radius *= 1.1
  } else if (type === `decelerate`) {
    name = c.randomFromArray(decelerateZoneNames)
    effects.push({
      type: `decelerate`,
      intensity,
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
    radius *= 0.2
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

// todo more names
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
  `Toxic Waste`,
  `Polluted Zone`,
  `Razor Cloud`,
  `Charring Field`,
  `Scorching Zone`,
]
const healZoneNames = [
  `Astral Oasis`,
  `Nanorepair Swarm`,
  `Healing Field`,
  `Restorative Zone`,
  `Astral Refuge`,
  `Healing Haven`,
  `Tidal Pool`,
  `Warm Current`,
  `Ethereal Refuge`,
]
const staminaRegenZoneNames = [
  `Energy Spring`,
  `Energizing Field`,
  `Relaxation Zone`,
  `Calming Flux`,
  `Rejuvenating Tide`,
  `Limpid Shallows`,
]
const accelerateZoneNames = [
  `Gravity Slingshot`,
  `Overcharge Field`,
  `Gravitational Anomaly`,
  `Boost Zone`,
  `Acceleration Field`,
  `Deep Eddy`,
  `Riptide`,
  `Trade Current`,
]
const decelerateZoneNames = [
  `Magnesis Field`,
  `Gravity Well`,
  `Murky Nebula`,
  `Stifling Zone`,
  `Deceleration Zone`,
  `Caustic Field`,
  `Encumbering Tide`,
]
const wormholeZoneNames = [
  `Wormhole`,
  `Eelhole`,
  `Universe Flux Point`,
  `Gravitational Rift`,
  `Bermuda Triangle`,
  `Warped Point`,
  `Abyssal Void`,
]
