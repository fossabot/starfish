import c from '../../../../../common/dist'

import type { Game } from '../../Game'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
import { MiningPlanet } from './MiningPlanet'
import type { Planet } from './Planet'

export class Comet extends MiningPlanet {
  velocity: CoordinatePair
  speed: number
  direction: number
  trail: PreviousLocation[]

  toUpdate: {
    landingRadiusMultiplier?: number
    passives?: ShipPassiveEffect[]
    trail?: PreviousLocation[]
    velocity?: CoordinatePair
    location?: CoordinatePair
    speed?: number
    direction?: number
  } = {}

  private previousLocation: CoordinatePair

  constructor(data: BaseCometData, game?: Game) {
    super(data, game)
    this.planetType = `comet`

    this.velocity = data.velocity
    this.speed = c.vectorToMagnitude(data.velocity)
    this.direction = c.vectorToDegrees(data.velocity)
    this.trail =
      (data.trail?.[0]?.location ? data.trail : []) || []

    this.previousLocation = [...this.location]
  }

  tick() {
    this.previousLocation = [...this.location]
    const shipsAt = this.shipsAt

    this.location[0] += this.velocity[0] || 0
    this.location[1] += this.velocity[1] || 0

    this.toUpdate.location = this.location
    this._stub = null

    // bring landed ships along with us as we move
    shipsAt.forEach((ship) => {
      if (!ship.canMove || ship.dead) return

      const newShipLocation = [
        ship.location[0] +
          (this.location[0] - this.previousLocation[0]),
        ship.location[1] +
          (this.location[1] - this.previousLocation[1]),
      ] as CoordinatePair

      if (
        c.distance(this.location, newShipLocation) <
        this.landingRadiusMultiplier *
          (this.game?.settings.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold)
      )
        ship.move([
          ship.location[0] + this.velocity[0] * 1.00001,
          ship.location[1] + this.velocity[1] * 1.00001,
        ])
    })

    // remove from game once it flies far out of the universe
    if (
      c.distance(this.location, [0, 0]) >
      (this.game?.gameSoftRadius || 1) * 1.3
    ) {
      this.game?.removePlanet(this)
      return
    }

    this.applyTickOfGravity()

    this.toUpdate.velocity = this.velocity
    this.speed = c.vectorToMagnitude(this.velocity)
    this.toUpdate.speed = this.speed
    this.direction = c.vectorToDegrees(this.velocity)
    this.toUpdate.direction = this.direction

    this.addPreviousLocation(
      this.previousLocation,
      this.location,
    )

    this.game?.chunkManager.addOrUpdate(
      this,
      this.previousLocation,
    )
  }

  applyTickOfGravity(this: Comet): void {
    const nearbyPlanets = (
      this.game?.chunkManager.getElementsWithinRadius(
        this.location,
        this.game?.settings.gravityRadius ||
          c.defaultGameSettings.gravityRadius,
      ) || []
    ).filter(
      (el) => el !== this && el.type === `planet`,
    ) as Planet[]
    for (let planet of nearbyPlanets || []) {
      const distance = c.distance(
        planet.location,
        this.location,
      )
      if (
        distance <=
          (this.game?.settings.gravityRadius ||
            c.defaultGameSettings.gravityRadius) &&
        distance >
          (this.game?.settings.arrivalThreshold ||
            c.defaultGameSettings.arrivalThreshold)
      ) {
        const vectorToAdd = c
          .getGravityForceVectorOnThisBodyDueToThatBody(
            this,
            planet,
            this.game?.settings.gravityCurveSteepness ||
              c.defaultGameSettings.gravityCurveSteepness,
            this.game?.settings.gravityMultiplier ||
              c.defaultGameSettings.gravityMultiplier,
            this.game?.settings.gravityRadius ||
              c.defaultGameSettings.gravityRadius,
          )
          // comes back as kg * m / second == N
          .map(
            (g) =>
              // todo work out this *10 from the math, put into gravityForceMultiplier
              (g * 10 * 100) /
              this.mass /
              c.kmPerAu /
              c.mPerKm,
          )
        // c.log(
        //   this.name,
        //   planet.name,
        //   Math.abs(vectorToAdd[0]) +
        //     Math.abs(vectorToAdd[1]),
        // )
        if (
          Math.abs(vectorToAdd[0]) +
            Math.abs(vectorToAdd[1]) <
          0.0000000000001
        )
          return

        this.velocity[0] += vectorToAdd[0]
        this.velocity[1] += vectorToAdd[1]
      }
    }
  }

  addPreviousLocation(
    this: Comet,
    previousLocation: CoordinatePair,
    currentLocation: CoordinatePair,
  ) {
    const spawnDistanceCutoff = 0.0003
    if (
      !previousLocation ||
      !currentLocation ||
      (this.trail.length > 1 &&
        previousLocation[0] ===
          this.trail[this.trail.length - 1]?.[0] &&
        previousLocation[1] ===
          this.trail[this.trail.length - 1]?.[1])
    )
      return

    const distance = c.distance(
      this.location,
      this.trail[this.trail.length - 1]?.location,
    )
    const angle =
      distance > spawnDistanceCutoff
        ? Math.abs(
            c.angleFromAToB(
              this.trail[this.trail.length - 1]?.location,
              previousLocation,
            ) -
              c.angleFromAToB(
                previousLocation,
                currentLocation,
              ),
          )
        : 0
    if (
      this.trail.length < 1 ||
      (angle >= 5 && distance > spawnDistanceCutoff) ||
      distance > 0.1
    ) {
      this.trail.push({
        time: Date.now(),
        location: [
          ...(currentLocation.map((l) =>
            c.r2(l, 7),
          ) as CoordinatePair),
        ],
      })
      while (this.trail.length > 100) this.trail.shift()
      this.toUpdate.trail = this.trail
    }
  }

  resetForNextMine(resourceId: MineableResource) {
    super.resetForNextMine(resourceId)

    // delete from existence once mined out
    if (
      !this.mine.length ||
      !this.mine.find((m) => (m.maxMineable ?? 1) >= 1)
    ) {
      this.shipsAt.forEach((ship) => {
        ship.logEntry(
          [
            `Resources on`,
            {
              text: this.name,
              color: this.color,
            },
            `exhausted; it crumbles into debris.`,
          ],
          `high`,
          `comet`,
        )
      })
      this.game?.removePlanet(this)
    }
  }

  async levelUp() {
    this.level++
    if (this.level > 100) this.level = 100

    const mineableResourceToAdd = c.randomFromArray([
      `shipCosmeticCurrency`,
      `crewCosmeticCurrency`,
    ]) as `shipCosmeticCurrency` | `crewCosmeticCurrency`
    this.addMineResource(mineableResourceToAdd)

    this.updateFrontendForShipsAt()
  }

  toAdminStub(): PlanetStub {
    const superStub = super.toAdminStub()
    return {
      ...superStub,
      velocity: this.velocity,
      speed: this.speed,
      direction: this.direction,
      trail: this.trail,
    }
  }

  toVisibleStub(): PlanetStub {
    const superStub = super.toVisibleStub()
    return {
      ...superStub,
      location: this.location,
      velocity: this.velocity,
      speed: this.speed,
      direction: this.direction,
      trail: this.trail,
    }
  }
}

/*

----- comets -----
- spawn at intervals irrespective of planet count in universe
  - ~.1/1AU in universe flying at once
  - at least 1 at all times
- spawn outside universe, fly across like dropship in a BR game
- despawn after leaving known universe + x distance
- fly at a fairly slow & steady speed
- carry any ships that get within its radius along with it
- has minor gravity of its own (you could get stuck on it?)
- mineable for rare/special resources
- depletes after x amount has been mined and disappears
- has a trail
- has a bright color


*/
