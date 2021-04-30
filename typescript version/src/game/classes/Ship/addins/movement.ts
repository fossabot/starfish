import c from '../../../../common'
import { Ship } from '../Ship'

interface ThrustResult {
  angle: number
  velocity: CoordinatePair
}

export function move(
  this: Ship,
  toLocation?: CoordinatePair,
) {
  if (toLocation) {
    this.location = toLocation
    return
  }
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
    velocity: this.velocity,
  }
}

export function applyTickOfGravity() {
  // c.log(`gravity`)
}
