import c from '../../../../../../common/dist'
import { stubify } from '../../../../server/io'
import { Planet } from '../../Planet'
import { HumanShip } from '../HumanShip'
import { Ship } from '../Ship'

export function move(
  this: Ship,
  toLocation?: CoordinatePair,
) {
  const previousLocation: CoordinatePair = [
    ...this.location,
  ]

  if (toLocation) {
    this.location = toLocation
  } else {
    if (!this.canMove) return

    const membersInCockpit = this.membersIn('cockpit')
    if (!membersInCockpit.length) return

    // ----- calculate new location based on target of each member in cockpit -----
    for (let member of membersInCockpit) {
      if (!member.targetLocation) continue

      // already there, so stop
      if (
        Math.abs(
          this.location[0] - member.targetLocation[0],
        ) < 0.000001 &&
        Math.abs(
          this.location[1] - member.targetLocation[1],
        ) < 0.000001
      )
        continue

      const unitVectorToTarget = c.degreesToUnitVector(
        c.angleFromAToB(
          this.location,
          member.targetLocation,
        ),
      )

      const thrustMagnitude =
        0.00001 *
        (member.skills.find((s) => s.skill === 'piloting')
          ?.level || 1)

      this.location[0] +=
        unitVectorToTarget[0] *
        thrustMagnitude *
        (c.deltaTime / 1000)
      this.location[1] +=
        unitVectorToTarget[1] *
        thrustMagnitude *
        (c.deltaTime / 1000)
    }
  }
  this.toUpdate.location = this.location

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
    this.previousLocations.push(previousLocation)
    while (
      this.previousLocations.length >
      Ship.maxPreviousLocations
    )
      this.previousLocations.shift()
    this.toUpdate.previousLocations = this.previousLocations
  }
  this.lastMoveAngle = newAngle
}

export function isAt(this: Ship, coords: CoordinatePair) {
  return (
    Math.abs(coords[0] - this.location[0]) < 0.00001 &&
    Math.abs(coords[1] - this.location[1]) < 0.00001
  )
}

export function stop(this: Ship) {
  this.velocity = [0, 0]
}

// export function thrust(
//   this: Ship,
//   angle: number,
//   force: number,
// ): ThrustResult {
//   c.log(`thrusting`, angle, force)
//   return {
//     angle,
//     velocity: c.vectorToMagnitude(this.velocity),
//     message: `hiiii`,
//   }
// }

export function applyTickOfGravity(this: Ship): void {
  if (!this.canMove) return
  // todo
  // c.log(`gravity`)
}
