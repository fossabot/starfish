import c from '../../../../../../common/dist'
import { stubify } from '../../../../server/io'
import { Planet } from '../../Planet'
import { Ship } from '../Ship'

const arrivalThreshold = 0.001

export function move(
  this: Ship,
  toLocation?: CoordinatePair,
) {
  const previousLocation: CoordinatePair = [
    ...this.location,
  ]

  const startingLocation = [...this.location]
  const membersInCockpit = this.membersIn(`cockpit`)
  if (!this.canMove || !membersInCockpit.length) {
    this.speed = 0
    this.velocity = [0, 0]
    this.toUpdate.speed = this.speed
    this.toUpdate.velocity = this.velocity
    return
  }

  // ----- calculate new location based on target of each member in cockpit -----
  for (let member of membersInCockpit) {
    if (!member.targetLocation) continue

    // already there, so stop
    if (
      Math.abs(
        this.location[0] - member.targetLocation[0],
      ) < arrivalThreshold &&
      Math.abs(
        this.location[1] - member.targetLocation[1],
      ) < arrivalThreshold
    )
      continue

    this.engines.forEach((e) => e.use())

    const unitVectorToTarget = c.degreesToUnitVector(
      c.angleFromAToB(this.location, member.targetLocation),
    )

    const skill =
      member.skills.find((s) => s.skill === `piloting`)
        ?.level || 1
    const thrustMagnitude = c.lerp(
      0.00001,
      0.0001,
      skill / 100,
    )

    this.location[0] +=
      unitVectorToTarget[0] *
      thrustMagnitude *
      (c.deltaTime / 1000)
    this.location[1] +=
      unitVectorToTarget[1] *
      thrustMagnitude *
      (c.deltaTime / 1000)
  }
  this.toUpdate.location = this.location

  this.velocity = [
    this.location[0] - startingLocation[0],
    this.location[1] - startingLocation[1],
  ]
  this.toUpdate.velocity = this.velocity
  this.speed = c.vectorToMagnitude(this.velocity)
  this.toUpdate.speed =
    this.speed * (c.deltaTime / c.TICK_INTERVAL)
  this.direction = c.vectorToDegrees(this.velocity)
  this.toUpdate.direction = this.direction

  // ----- update planet -----
  const previousPlanet = this.planet
  this.planet =
    this.game.planets.find((p) => this.isAt(p.location)) ||
    false
  if (previousPlanet !== this.planet)
    this.toUpdate.planet = this.planet
      ? stubify<Planet, PlanetStub>(this.planet)
      : false

  // ----- add previousLocation -----
  const newAngle = c.angleFromAToB(
    this.location,
    previousLocation,
  )
  if (Math.abs(newAngle - this.lastMoveAngle) > 8) {
    const lastPrevLoc =
      this.previousLocations[
        this.previousLocations.length - 1
      ]
    if (
      !lastPrevLoc ||
      c.distance(this.location, lastPrevLoc) > 0.0001
    ) {
      this.previousLocations.push(previousLocation)
      while (
        this.previousLocations.length >
        Ship.maxPreviousLocations
      )
        this.previousLocations.shift()
      this.toUpdate.previousLocations =
        this.previousLocations
    }
  }
  this.lastMoveAngle = newAngle
}

export function isAt(this: Ship, coords: CoordinatePair) {
  return (
    Math.abs(coords[0] - this.location[0]) <
      arrivalThreshold &&
    Math.abs(coords[1] - this.location[1]) <
      arrivalThreshold
  )
}

export function stop(this: Ship) {
  this.velocity = [0, 0]
}

export function applyTickOfGravity(this: Ship): void {
  // if (!this.canMove) return
  // todo
}
