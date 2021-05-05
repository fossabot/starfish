import c from '../../../../../../common/dist'
import { Ship } from '../Ship'

export function move(
  this: Ship,
  toLocation?: CoordinatePair,
) {
  if (toLocation) {
    this.location = toLocation
    return
  }

  if (!this.canMove) return

  this.location[0] += this.velocity[0]
  this.location[1] += this.velocity[1]
}

export function stop(this: Ship) {
  this.velocity = [0, 0]
}

export function thrust(
  this: Ship,
  angle: number,
  force: number,
): ThrustResult {
  c.log(`thrusting`, angle, force)
  return {
    angle,
    velocity: c.vectorToMagnitude(this.velocity),
    message: `hiiii`,
  }
}

export function applyTickOfGravity(this: Ship): void {
  if (!this.canMove) return
  // todo
  // c.log(`gravity`)
}
