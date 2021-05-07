import c from '../../../../../../common/dist'
import { io } from '../../../../server/io'
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
    if (this.atTargetLocation) return

    const membersInCockpit = this.membersIn('cockpit')
    if (!membersInCockpit.length) return

    // ----- calculate new location -----
    const unitVectorToTarget = c.degreesToUnitVector(
      c.angleFromAToB(this.location, this.targetLocation),
    )

    const thrustMagnitude =
      0.00001 * membersInCockpit.length // todo

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

  // ----- add previousLocations -----
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
