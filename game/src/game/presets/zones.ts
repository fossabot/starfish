import c from '../../../../common/dist'
import type { Faction } from '../classes/Faction'
import type { Planet } from '../classes/Planet'
import type { Game } from '../Game'
import factions from './factions'
import { data as passiveData } from './crewPassives'
import { data as cargoData } from './cargo'
import * as itemData from './items'
import type { Ship } from '../classes/Ship/Ship'
import type { Zone } from '../classes/Zone'

export function generateZoneData(
  game: Game,
): BaseZoneData | false {
  let locationSearchRadius = game.gameSoftRadius * 0.75
  const tooClose = 0.8
  let location: CoordinatePair = [0, 0]
  const isTooClose = (p: Planet | Ship | Zone) =>
    c.distance(location, p.location) < tooClose
  const getClosestPlanet = (closest: Planet, p: Planet) =>
    c.distance(p.location, location) <
    c.distance(closest?.location || [0, 0], location)
      ? p
      : closest
  while (
    game.planets.find(isTooClose) ||
    game.zones.find(isTooClose) ||
    game.humanShips.find(isTooClose) ||
    c.distance(location, [0, 0]) > game.gameSoftRadius
  ) {
    location = c.randomInsideCircle(locationSearchRadius)
    locationSearchRadius *= 1.01
  }

  let radius = (Math.random() + 0.15) * 0.2

  const color = `hsl(${Math.random() * 360}, ${Math.round(
    Math.random() * 80 + 20,
  )}%, ${Math.round(Math.random() * 40) + 30}%)`

  const type: ZoneEffectType =
    Math.random() > 0.2
      ? `damage over time`
      : `repair over time`

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
  } else {
    name = c.randomFromArray(healZoneNames)
    effects.push({
      type: `repair over time`,
      intensity: Math.random() * 0.01,
      procChancePerTick: 1,
    })
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
