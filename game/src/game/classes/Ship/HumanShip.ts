import c from '../../../../../common/dist'
import { db } from '../../../db'
import io from '../../../server/io'

import { membersIn, cumulativeSkillIn } from './addins/crew'

import { CombatShip } from './CombatShip'
import type { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import type { AttackRemnant } from '../AttackRemnant'
import type { Planet } from '../Planet/Planet'
import type { BasicPlanet } from '../Planet/BasicPlanet'
import type { Cache } from '../Cache'
import type { Ship } from './Ship'
import type { Zone } from '../Zone'
import type { AIShip } from './AIShip'
import type { Item } from '../Item/Item'

import { Tutorial } from './addins/Tutorial'

export class HumanShip extends CombatShip {
  static maxLogLength = 40
  static movementIsFree = false // true

  readonly id: string
  log: LogEntry[] = []
  logAlertLevel: LogAlertLevel = `medium`
  readonly crewMembers: CrewMember[] = []
  captain: string | null = null
  rooms: { [key in CrewLocation]?: BaseRoomData } = {}
  maxScanProperties: ShipScanDataShape | null = null

  visible: {
    ships: ShipStub[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
    trails?: CoordinatePair[][]
    zones: Zone[]
  } = {
    ships: [],
    planets: [],
    caches: [],
    attackRemnants: [],
    zones: [],
  }

  shownPanels?: any[]

  commonCredits: number = 0

  mainTactic: Tactic | undefined
  itemTarget: ItemType | undefined

  tutorial: Tutorial | undefined = undefined

  constructor(data: BaseHumanShipData, game: Game) {
    super(data, game)
    this.id = data.id

    // this.availableTaglines = [] // `Tester`, `Very Shallow`
    // this.availableHeaderBackgrounds = [
    //   `Default`,
    //   // `Flat 1`,
    //   // `Flat 2`,
    //   // `Gradient 1`,
    //   // `Gradient 2`,
    //   // `Gradient 3`,
    //   // `Constellation 1`,
    //   // `Vintage 1`,
    // ]
    // this.availableHeaderBackgrounds.push(
    //   c.capitalize(this.faction.id) + ` Faction 1`,
    // )

    this.ai = false
    this.human = true

    this.speed = c.vectorToMagnitude(this.velocity)
    this.toUpdate.speed = this.speed
    this.direction = c.vectorToDegrees(this.velocity)
    this.toUpdate.direction = this.direction

    this.captain = data.captain || null
    this.log = data.log || []

    if (data.tutorial && data.tutorial.step !== undefined)
      this.tutorial = new Tutorial(data.tutorial, this)

    // human ships always know where their homeworld is
    if (
      this.faction.homeworld &&
      !this.seenPlanets.find(
        (p) => p === this.faction.homeworld,
      )
    )
      this.discoverPlanet(this.faction.homeworld)

    this.recalculateShownPanels()

    if (data.commonCredits)
      this.commonCredits = data.commonCredits

    if (data.logAlertLevel)
      this.logAlertLevel = data.logAlertLevel

    this.resolveRooms()

    data.crewMembers?.forEach((cm) => {
      this.addCrewMember(cm, true)
    })

    if (!this.log.length && !this.tutorial)
      // timeout so that the first messages don't spawn multiple alerts channels
      setTimeout(
        () =>
          this.logEntry(
            [
              `Your crew boards the ship`,
              {
                text: this.name,
                color: this.faction.color,
              },
              `for the first time, and sets out towards the stars.`,
            ],
            `medium`,
          ),
        2000,
      )

    this.updateMaxScanProperties()
    this.updateVisible()
    this.recalculateMass()

    if (!this.tutorial) this.updatePlanet(true)

    setTimeout(() => {
      this.radii.gameSize = this.game.gameSoftRadius
      this.toUpdate.radii = this.radii
    }, 100)
  }

  tick() {
    const profiler = new c.Profiler(
      4,
      `human ship tick`,
      false,
      0,
    )
    super.tick()
    if (this.dead) return

    if (this.tutorial) this.tutorial.tick()

    profiler.step(`move`)
    // ----- move -----
    this.move()

    // ----- planet effects -----
    if (this.planet) {
      this.addStat(`planetTime`, 1)
      if (this.planet.planetType === `basic`) {
        if ((this.planet as BasicPlanet).repairFactor > 0) {
          const isAllied =
            ((this.planet as BasicPlanet).allegiances.find(
              (a) => a.faction.id === this.faction.id,
            )?.level || 0) >=
            c.factionAllegianceFriendCutoff
          this.repair(
            (this.planet as BasicPlanet).repairFactor *
              0.000005 *
              c.gameSpeedMultiplier *
              (isAllied ? 2 : 1),
          )
        }
      }
    }

    profiler.step(`update visible`)
    // ----- scan -----
    const previousVisible = { ...this.visible }
    this.updateVisible()
    this.generateVisiblePayload(previousVisible)
    this.takeActionOnVisibleChange(
      previousVisible,
      this.visible,
    )
    this.scanners.forEach((s) => s.use())

    profiler.step(`crew tick & stubify`)
    this.crewMembers.forEach((cm) => cm.tick())
    this.toUpdate.crewMembers = this.crewMembers
      .filter((cm) => Object.keys(cm.toUpdate || {}).length)
      .map((cm) => {
        const updates = {
          ...c.stubify(cm.toUpdate),
          id: cm.id,
        }
        cm.toUpdate = {}
        return updates as CrewMemberStub
      })
    if (!this.toUpdate.crewMembers?.length)
      delete this.toUpdate.crewMembers
    // c.log(
    //   `updated ${this.crewMembers.map((cm) =>
    //     Object.keys(cm.toUpdate),
    //   )} crew members on ${this.name}`,
    // )

    profiler.step(`discover planets`)
    // ----- discover new planets -----
    const newPlanets = this.visible.planets.filter(
      (p) => !this.seenPlanets.includes(p),
    )
    newPlanets.forEach((p) => this.discoverPlanet(p))
    // ----- discover new landmarks -----
    const newLandmarks = this.visible.zones.filter(
      (z) => !this.seenLandmarks.includes(z),
    )
    newLandmarks.forEach((p) => this.discoverLandmark(p))

    profiler.step(`get caches`)
    // ----- get nearby caches -----
    // * this is on a random timeout so that the "first" ship doesn't always have priority on picking up caches if 2 or more ships could have gotten it
    setTimeout(() => {
      if (!this.dead)
        this.visible.caches.forEach((cache) => {
          if (this.isAt(cache.location)) {
            if (!cache.canBePickedUpBy(this)) return
            this.getCache(cache)
          }
        })
    }, Math.round((Math.random() * c.tickInterval) / 3))

    profiler.step(`auto attack`)
    // ----- auto-attacks -----
    if (!this.dead) this.autoAttack()

    // ----- zone effects -----
    if (!this.dead) this.applyZoneTickEffects()

    profiler.step(`frontend stubify`)
    // todo if no io watchers, skip this
    // ----- updates for frontend -----
    this.toUpdate.items = this.items.map((i) => i.stubify())

    profiler.step(`frontend send`)
    // ----- send update to listeners -----
    if (Object.keys(this.toUpdate).length) {
      // c.log(
      //   `sending`,
      //   Object.keys(this.toUpdate).map(
      //     (k) =>
      //       `${k}: ${
      //         JSON.stringify(this.toUpdate[k])?.length
      //       }`,
      //   ),
      //   `characters to frontend for`,
      //   this.name,
      // )
      // this.toUpdate.log?.forEach((l) => {
      //   c.log(l)
      //   if (Array.isArray(l.content))
      //     l.content.forEach((n) => {
      //       if (typeof n === `object`) c.log(n.tooltipData)
      //     })
      // })
      // c.log(JSON.stringify(this.toUpdate.log))
      // c.log(JSON.stringify(this.toUpdate, null, 2))
      io.to(`ship:${this.id}`).emit(`ship:update`, {
        id: this.id,
        updates: this.toUpdate,
      })
      this.toUpdate = {}
    }
    profiler.end()
  }

  // ----- log -----

  logEntry(content: LogContent, level: LogLevel = `low`) {
    if (!this.log) this.log = []
    this.log.push({ level, content, time: Date.now() })
    while (this.log.length > HumanShip.maxLogLength)
      this.log.shift()

    this.toUpdate.log = this.log

    if (this.logAlertLevel === `off`) return
    const levelsToAlert = [this.logAlertLevel]
    if (this.logAlertLevel === `low`)
      levelsToAlert.push(`medium`, `high`, `critical`)
    if (this.logAlertLevel === `medium`)
      levelsToAlert.push(`high`, `critical`)
    if (this.logAlertLevel === `high`)
      levelsToAlert.push(`critical`)
    if (levelsToAlert.includes(level))
      io.emit(
        `ship:message`,
        this.id,
        Array.isArray(content)
          ? content
              .map(
                (ce) =>
                  ((ce as RichLogContentElement).text ||
                    ce) +
                  ((ce as RichLogContentElement).url
                    ? ` (${c.frontendUrl.replace(
                        /\/s[^/]*\/?$/,
                        ``,
                      )}${
                        (ce as RichLogContentElement).url
                      })`
                    : ``),
              )
              .join(` `)
              .replace(/\s*&nospace/g, ``)
          : content,
      )
  }

  discoverPlanet(p: Planet) {
    this.seenPlanets.push(p)
    this.toUpdate.seenPlanets = this.seenPlanets.map((p) =>
      p.toVisibleStub(),
    )
    if (!this.onlyCrewMemberIsInTutorial)
      this.logEntry(
        [
          `Discovered the planet`,
          {
            text: p.name,
            color: p.color,
            tooltipData: p.toLogStub() as any,
          },
          `&nospace!`,
        ],
        `high`,
      )

    this.addStat(`seenPlanets`, 1)

    if (this.seenPlanets.length >= 5)
      this.addTagline(
        `Small Pond Paddler`,
        `discovering 5 planets`,
      )
    if (this.seenPlanets.length >= 10)
      this.addHeaderBackground(
        `Constellation 1`,
        `discovering 10 planets`,
      )
    if (this.seenPlanets.length >= 15)
      this.addTagline(
        `Current Rider`,
        `discovering 15 planets`,
      )
    if (this.seenPlanets.length >= 30)
      this.addTagline(`Migratory`, `discovering 30 planets`)
    if (this.seenPlanets.length >= 100)
      this.addTagline(
        `EAC-zy Rider`,
        `discovering 100 planets`,
      )
  }

  discoverLandmark(l: Zone) {
    this.seenLandmarks.push(l)
    this.toUpdate.seenLandmarks = this.seenLandmarks.map(
      (z) => z.toVisibleStub(),
    )
    if (!this.onlyCrewMemberIsInTutorial)
      this.logEntry(
        [
          `Discovered`,
          {
            text: l.name,
            color: l.color,
            tooltipData: l.toLogStub() as any,
          },
          `&nospace!`,
        ],
        `high`,
      )

    this.addStat(`seenLandmarks`, 1)
  }

  applyThrust(
    targetLocation: CoordinatePair,
    charge: number, // 0 to 1 % of AVAILABLE charge to use
    thruster: CrewMember,
  ) {
    // add xp
    const xpBoostMultiplier =
      this.passives
        .filter((p) => p.id === `boostXpGain`)
        .reduce(
          (total, p) => (p.intensity || 0) + total,
          0,
        ) + 1
    thruster.addXp(
      `piloting`,
      c.baseXpGain *
        2000 *
        charge *
        thruster.cockpitCharge *
        xpBoostMultiplier,
    )

    charge *= thruster.cockpitCharge

    if (!HumanShip.movementIsFree)
      thruster.cockpitCharge -= charge

    const initialVelocity: CoordinatePair = [
      ...this.velocity,
    ]
    const initialMagnitude =
      c.vectorToMagnitude(initialVelocity)
    const initialAngle = this.direction

    const memberPilotingSkill =
      thruster.piloting?.level || 1
    const engineThrustMultiplier = Math.max(
      c.noEngineThrustMagnitude,
      this.engines
        .filter((e) => e.repair > 0)
        .reduce(
          (total, e) =>
            total + e.thrustAmplification * e.repair,
          0,
        ) * c.baseEngineThrustMultiplier,
    )
    const magnitudePerPointOfCharge =
      c.getThrustMagnitudeForSingleCrewMember(
        memberPilotingSkill,
        engineThrustMultiplier,
      )
    const shipMass = this.mass
    const thrustMagnitudeToApply =
      (magnitudePerPointOfCharge * charge) / shipMass

    let zeroedAngleToTargetInDegrees = c.angleFromAToB(
      this.location,
      targetLocation,
    )

    let angleToThrustInDegrees = 0

    const TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH = false

    if (!TEMPT_THE_GODS_SEMICOLON_USE_THE_MATH) {
      // c.log(`ez mode`)
      angleToThrustInDegrees = zeroedAngleToTargetInDegrees
    }

    // * Do we dare?????
    else {
      // ----- here comes the math -----

      if (zeroedAngleToTargetInDegrees > 180)
        zeroedAngleToTargetInDegrees -= 360

      const angleDifferenceFromVelocityToTargetInRadians =
        (c.degreesToRadians(
          c.angleDifference(
            zeroedAngleToTargetInDegrees,
            this.direction,
            true,
          ),
        ) +
          2 * Math.PI) %
        (2 * Math.PI)
      // normalized to 0~2pi

      const isAcute =
        angleDifferenceFromVelocityToTargetInRadians <
          Math.PI / 2 ||
        angleDifferenceFromVelocityToTargetInRadians >
          Math.PI * (3 / 2)

      let zeroedAngleToThrustInRadians = 0

      c.log({
        initialVelocity,
        initialMagnitude,
        thrustMagnitudeToApply,
        isAcute,
        angleDifferenceFromVelocityToTargetInRadians,
        angleDifferenceFromVelocityToTargetInDegrees:
          c.radiansToDegrees(
            angleDifferenceFromVelocityToTargetInRadians,
          ),
      })

      // * acute case!
      if (isAcute) {
        // the distance to the closest point on the target line from the velocity vector
        const distanceToClosestPointOnTargetLineFromVelocity =
          Math.abs(
            initialMagnitude *
              Math.sin(
                c.degreesToRadians(
                  zeroedAngleToTargetInDegrees,
                ),
              ),
          )

        const didHaveExcessMagnitude =
          thrustMagnitudeToApply >
          distanceToClosestPointOnTargetLineFromVelocity

        // angle from the tip of the velocity line that forms a right angle when it intersects the target line
        const zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians =
          Math.PI -
          Math.PI / 2 -
          (angleDifferenceFromVelocityToTargetInRadians <=
          Math.PI
            ? angleDifferenceFromVelocityToTargetInRadians
            : Math.PI -
              angleDifferenceFromVelocityToTargetInRadians)

        if (!didHaveExcessMagnitude) {
          c.log(
            `using line that forms right angle to target`,
          )
          zeroedAngleToThrustInRadians =
            zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians
        } else {
          // we have "excess" magnitude, so the line needs to extend out along target line to match magnitude length
          c.log(
            `adjusting line to account for excess magnitude`,
          )
          const additionalDistanceToMoveAlongTargetLine =
            Math.PI -
            Math.sqrt(
              thrustMagnitudeToApply ** 2 -
                distanceToClosestPointOnTargetLineFromVelocity **
                  2,
            )
          const additionalAngleToAddToThrustAngle =
            Math.acos(
              (distanceToClosestPointOnTargetLineFromVelocity **
                2 +
                thrustMagnitudeToApply ** 2 -
                additionalDistanceToMoveAlongTargetLine **
                  2) /
                (2 *
                  distanceToClosestPointOnTargetLineFromVelocity *
                  thrustMagnitudeToApply),
            )
          // Math.asin(
          //   (additionalDistanceToMoveAlongTargetLine /
          //     thrustMagnitudeToApply)
          // )
          c.log({
            additionalDistanceToMoveAlongTargetLine,
            additionalAngleToAddToThrustAngle,
          })
          zeroedAngleToThrustInRadians +=
            additionalAngleToAddToThrustAngle
        }

        c.log({
          distanceToClosestPointOnTargetLineFromVelocity,
          didHaveExcessMagnitude,
          zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians,
          zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInDegrees:
            c.radiansToDegrees(
              zeroedAngleFromVelocityVectorToClosestPointOnTargetLineInRadians,
            ),
        })
      }

      // * obtuse case
      else {
        const didHaveExcessMagnitude =
          thrustMagnitudeToApply > initialMagnitude

        // if it's shorter than the velocity vector
        if (!didHaveExcessMagnitude) {
          // straight back opposite the velocity vector
          // ? we know their target point, should we try to make the vector to that point instead?
          zeroedAngleToThrustInRadians = Math.PI
          c.log(`thrusting back along velocity vector`)
        }

        // otherwise, we use the excess length to hit the furthest point along the target line that we can
        else {
          c.log(`targeting point along target angle`)
          const distanceDownThrustAngleFromOriginToHit =
            Math.sqrt(
              thrustMagnitudeToApply ** 2 -
                initialMagnitude ** 2,
            )

          const angleFromVelocityVectorToPointOnTargetLineInRadians =
            Math.PI -
            Math.acos(
              (thrustMagnitudeToApply ** 2 +
                initialMagnitude ** 2 -
                distanceDownThrustAngleFromOriginToHit **
                  2) /
                (2 *
                  thrustMagnitudeToApply *
                  initialMagnitude),
            )
          // Math.asin(
          //   (distanceDownThrustAngleFromOriginToHit *
          //     (Math.sin(
          //       angleDifferenceFromVelocityToTargetInRadians <
          //         Math.PI
          //         ? angleDifferenceFromVelocityToTargetInRadians
          //         : Math.PI * 2 -
          //             angleDifferenceFromVelocityToTargetInRadians,
          //     ) /
          //       thrustMagnitudeToApply)) %
          //     1,
          // )

          zeroedAngleToThrustInRadians =
            angleFromVelocityVectorToPointOnTargetLineInRadians

          c.log({
            didHaveExcessMagnitude,
            distanceDownThrustAngleFromOriginToHit,
            angleFromVelocityVectorToPointOnTargetLineInRadians,
            angleFromVelocityVectorToPointOnTargetLineInDegrees:
              c.radiansToDegrees(
                angleFromVelocityVectorToPointOnTargetLineInRadians,
              ),
          })
        }
      }

      c.log({
        zeroedAngleToThrustInRadians,
        zeroedAngleToThrustInDegrees: c.radiansToDegrees(
          zeroedAngleToThrustInRadians,
        ),
      })

      // this angle assumes we're going at 0 degrees. rotate it to fit the actual current angle...
      angleToThrustInDegrees =
        (this.direction +
          c.radiansToDegrees(zeroedAngleToThrustInRadians) +
          360) %
        360

      if (isNaN(angleToThrustInDegrees)) return c.log(`nan`)

      // ----- done with big math -----
    }

    // const unitVectorToTarget =
    //   c.unitVectorFromThisPointToThatPoint(
    //     this.location,
    //     targetLocation,
    //   )
    // const distanceToTarget = c.distance(
    //   this.location,
    //   targetLocation,
    // )
    // const vectorToTarget = [
    //   unitVectorToTarget[0] * distanceToTarget,
    //   unitVectorToTarget[1] * distanceToTarget,
    // ]

    const unitVectorAlongWhichToThrust =
      c.degreesToUnitVector(angleToThrustInDegrees)

    const thrustVector: CoordinatePair = [
      unitVectorAlongWhichToThrust[0] *
        thrustMagnitudeToApply,
      unitVectorAlongWhichToThrust[1] *
        thrustMagnitudeToApply,
    ]

    this.velocity = [
      this.velocity[0] + thrustVector[0],
      this.velocity[1] + thrustVector[1],
    ]
    this.toUpdate.velocity = this.velocity
    this.speed = c.vectorToMagnitude(this.velocity)
    this.toUpdate.speed = this.speed
    this.direction = c.vectorToDegrees(this.velocity)
    this.toUpdate.direction = this.direction

    // const thrustAngle = c.vectorToDegrees(thrustVector)
    // c.log({
    //   mass: this.mass,
    //   charge,
    //   memberPilotingSkill,
    //   engineThrustMultiplier,
    //   magnitudePerPointOfCharge,
    //   finalMagnitude: thrustMagnitudeToApply,
    //   targetLocation,
    //   zeroedAngleToTargetInDegrees,
    //   // unitVectorToTarget,
    //   // vectorToTarget,
    //   thrustVector,
    //   thrustAngle,
    //   initialVelocity,
    //   initialMagnitude,
    //   initialAngle,
    //   velocity: this.velocity,
    //   speed: this.speed,
    //   direction: this.direction,
    // })

    if (charge > 0.25) {
      let targetData: LogContent | undefined
      const foundPlanet = this.seenPlanets.find(
        (planet) =>
          c.distance(planet.location, targetLocation) <
          c.arrivalThreshold * 5,
      )
      if (foundPlanet)
        targetData = [
          {
            text: foundPlanet.name,
            color: foundPlanet.color,
            tooltipData: foundPlanet.toLogStub() as any,
          },
        ]
      if (!targetData) {
        const foundCache = this.visible.caches.find(
          (ca) =>
            ca.location[0] === targetLocation[0] &&
            ca.location[1] === targetLocation[1],
        )
        if (foundCache)
          targetData = [
            {
              text: `a cache`,
              color: `var(--cache)`,
              tooltipData: this.cacheToValidScanResult(
                foundCache,
              ) as any,
            },
            `at ${c.r2(zeroedAngleToTargetInDegrees, 0)}°`,
          ]
      }
      if (!targetData) {
        const foundLandmark = this.seenLandmarks.find((l) =>
          c.pointIsInsideCircle(
            l.location,
            targetLocation,
            l.radius,
          ),
        )
        if (foundLandmark)
          targetData = [
            {
              text: foundLandmark.name,
              color: foundLandmark.color,
              tooltipData: foundLandmark.toLogStub() as any,
            },
          ]
      }
      if (!targetData) {
        const foundShip = this.visible.ships.find(
          (s) =>
            c.distance(s.location, targetLocation) <
            c.arrivalThreshold * 5,
        )
        if (foundShip) {
          const fullShip = this.game.ships.find(
            (s) => s.id === foundShip.id,
          )
          if (fullShip)
            targetData = [
              `the ship`,
              {
                text: fullShip.name,
                color: fullShip.faction?.color,
                tooltipData: fullShip.toLogStub() as any,
              },
            ]
        }
      }

      if (!targetData)
        targetData = [
          {
            text: `${c.r2(
              zeroedAngleToTargetInDegrees,
              0,
            )}°`,
          },
        ]

      this.logEntry(
        [
          thruster.name,
          `thrusted towards`,
          ...targetData,
          `with ${c.r2(
            magnitudePerPointOfCharge * charge,
          )}`,
          { text: `&nospaceP`, tooltipData: `Poseidons` },
          `of thrust.`,
        ],
        `low`,
      )
    }

    if (!HumanShip.movementIsFree)
      this.engines.forEach((e) => e.use(charge))
  }

  brake(charge: number, thruster: CrewMember) {
    // add xp
    const xpBoostMultiplier =
      (this.passives.find((p) => p.id === `boostXpGain`)
        ?.intensity || 0) + 1
    thruster.addXp(
      `piloting`,
      c.baseXpGain *
        2000 *
        charge *
        thruster.cockpitCharge *
        xpBoostMultiplier,
    )

    charge *= thruster.cockpitCharge
    if (!HumanShip.movementIsFree)
      thruster.cockpitCharge -= charge

    charge *= c.brakeToThrustRatio // braking is easier than thrusting

    // apply passive
    let passiveBrakeMultiplier =
      1 + this.getPassiveIntensity(`boostBrake`)
    charge *= passiveBrakeMultiplier

    const memberPilotingSkill =
      thruster.piloting?.level || 1
    const engineThrustMultiplier = Math.max(
      c.noEngineThrustMagnitude,
      this.engines
        .filter((e) => e.repair > 0)
        .reduce(
          (total, e) =>
            total + e.thrustAmplification * e.repair,
          0,
        ) * c.baseEngineThrustMultiplier,
    )
    const magnitudePerPointOfCharge =
      c.getThrustMagnitudeForSingleCrewMember(
        memberPilotingSkill,
        engineThrustMultiplier,
      )
    const shipMass = this.mass

    const finalMagnitude =
      (magnitudePerPointOfCharge * charge) / shipMass

    const currentVelocity: CoordinatePair = [
      ...this.velocity,
    ]
    const currentMagnitude =
      c.vectorToMagnitude(currentVelocity)

    if (finalMagnitude > currentMagnitude) this.hardStop()
    else {
      const relativeScaleOfMagnitudeShrink =
        (currentMagnitude - finalMagnitude) /
        currentMagnitude
      this.velocity = [
        this.velocity[0] * relativeScaleOfMagnitudeShrink,
        this.velocity[1] * relativeScaleOfMagnitudeShrink,
      ]
    }

    this.toUpdate.velocity = this.velocity
    this.speed = c.vectorToMagnitude(this.velocity)
    this.toUpdate.speed = this.speed
    this.direction = c.vectorToDegrees(this.velocity)
    this.toUpdate.direction = this.direction

    if (charge > 1.5)
      this.logEntry(
        [
          thruster.name,
          `applied the brakes with ${c.r2(
            magnitudePerPointOfCharge * charge,
          )}`,
          { text: `&nospaceP`, tooltipData: `Poseidons` },
          `of thrust.`,
        ],
        `low`,
      )

    if (!HumanShip.movementIsFree)
      this.engines.forEach((e) => e.use(charge))
  }

  // ----- move -----
  move(toLocation?: CoordinatePair) {
    super.move(toLocation)
    if (toLocation) {
      this.updateVisible()
      this.updatePlanet()
      return
    }

    if (!this.canMove) {
      this.hardStop()
      return
    }

    const startingLocation: CoordinatePair = [
      ...this.location,
    ]

    this.location[0] += this.velocity[0]
    this.location[1] += this.velocity[1]
    this.toUpdate.location = this.location

    this.addPreviousLocation(
      startingLocation,
      this.location,
    )

    this.updatePlanet()
    this.notifyZones(startingLocation)

    this.addStat(
      `distanceTraveled`,
      c.distance(startingLocation, this.location),
    )

    const speed =
      (c.vectorToMagnitude(this.velocity) *
        (1000 * 60 * 60)) /
      c.tickInterval
    if (speed > 1)
      this.addTagline(`River Runner`, `going over 1AU/hr`)
    if (speed > 3)
      this.addHeaderBackground(
        `Crimson Blur`,
        `going over 3AU/hr`,
      )
    if (speed > 7.21436)
      this.addHeaderBackground(
        `Lightspeedy`,
        `breaking the speed of light`,
      )
    if (speed > 15)
      this.addTagline(`Flying Fish`, `going over 15AU/hr`)
    if (speed > 30)
      this.addTagline(
        `Hell's Angelfish`,
        `going over 30AU/hr`,
      )
    if (speed > this.getStat(`highestSpeed`))
      this.setStat(`highestSpeed`, speed)

    // ----- end if in tutorial -----
    if (this.tutorial && this.tutorial.currentStep) {
      // reset position if outside max distance from spawn
      if (
        this.tutorial.currentStep.maxDistanceFromSpawn &&
        c.distance(
          this.tutorial.baseLocation,
          this.location,
        ) > this.tutorial.currentStep.maxDistanceFromSpawn
      ) {
        const unitVectorFromSpawn =
          c.unitVectorFromThisPointToThatPoint(
            this.tutorial.baseLocation,
            this.location,
          )
        this.move([
          this.tutorial.baseLocation[0] +
            unitVectorFromSpawn[0] *
              0.999 *
              this.tutorial.currentStep
                .maxDistanceFromSpawn,
          this.tutorial.baseLocation[1] +
            unitVectorFromSpawn[1] *
              0.999 *
              this.tutorial.currentStep
                .maxDistanceFromSpawn,
        ])
        this.hardStop()
        this.logEntry(
          `Automatically stopped the ship — Let's keep it close to home while we're learning the ropes.`,
          `high`,
        )
      }

      return
    }

    // ----- game radius -----
    this.radii.gameSize = this.game.gameSoftRadius
    this.toUpdate.radii = this.radii
    const isOutsideRadius =
      c.distance([0, 0], this.location) >
      this.game.gameSoftRadius
    const startedOutsideRadius =
      c.distance([0, 0], startingLocation) >
      this.game.gameSoftRadius
    if (isOutsideRadius && !startedOutsideRadius) {
      this.hardStop()
      this.logEntry(
        `Stopped at the edge of the known universe. You can continue, but nothing but the void awaits out here.`,
        `high`,
      )
    }
    if (!isOutsideRadius && startedOutsideRadius)
      this.logEntry(
        `Re-entered the known universe.`,
        `high`,
      )

    // ----- random encounters -----
    const distanceTraveled = c.distance(
      this.location,
      startingLocation,
    )
    // - space junk -
    if (
      c.lottery(
        distanceTraveled * (c.deltaTime / c.tickInterval),
        2,
      )
    ) {
      // apply "amount boost" passive
      const amountBoostPassive =
        this.getPassiveIntensity(`boostDropAmount`)

      const amount = c.r2(
        (Math.round(
          Math.random() * 3 * (Math.random() * 3),
        ) /
          10 +
          1.5) *
          (1 + amountBoostPassive),
      )

      const id: CargoId = c.randomFromArray([
        `oxygen`,
        `salt`,
        `water`,
        `carbon`,
        `plastic`,
        `steel`,
      ] as CargoId[])
      this.distributeCargoAmongCrew([{ id, amount }])
      this.logEntry([
        `Encountered some space junk and managed to harvest ${amount} ton${
          amount === 1 ? `` : `s`
        } of`,
        {
          text: id,
          tooltipData: {
            ...c.cargo[id],
            type: `cargo`,
          },
        },
        `off of it.`,
      ])
    }

    // - asteroid hit -
    if (
      !this.planet &&
      this.attackable &&
      c.lottery(
        distanceTraveled * (c.deltaTime / c.tickInterval),
        5,
      )
    ) {
      let miss = false
      const hitRoll = Math.random()
      if (hitRoll < 0.1) miss = true
      // random passive miss chance
      else miss = hitRoll < this.chassis.agility * 0.5
      const damage =
        this._maxHp * c.randomBetween(0.01, 0.15)
      this.takeDamage(
        { name: `an asteroid` },
        {
          damage: miss ? 0 : damage,
          miss,
        },
      )
    }
  }

  hardStop() {
    this.velocity = [0, 0]
    this.speed = 0
    this.toUpdate.velocity = this.velocity
    this.toUpdate.speed = this.speed
  }

  updateVisible() {
    const targetTypes =
      this.tutorial?.currentStep?.visibleTypes
    const visible = this.game.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      targetTypes,
      true,
      Boolean(this.tutorial),
    )
    const shipsWithValidScannedProps: ShipStub[] =
      visible.ships.map((s) =>
        this.shipToValidScanResult(s),
      )
    this.visible = {
      ...visible,
      ships: shipsWithValidScannedProps,
    }
  }

  generateVisiblePayload(previousVisible?: {
    ships: ShipStub[]
    planets: Planet[]
    caches: Cache[]
    attackRemnants: AttackRemnant[]
    trails?: CoordinatePair[][]
    zones: Zone[]
  }) {
    let planetDataToSend: Partial<PlanetStub>[] = []
    if (previousVisible?.planets?.length)
      planetDataToSend = this.visible.planets
        .filter((p) => Object.keys(p.toUpdate).length)
        .map((p) => ({
          name: p.name,
          ...(c.stubify(p.toUpdate) as Partial<PlanetStub>),
        }))
    else
      planetDataToSend = this.visible.planets.map((p) =>
        p.toVisibleStub(),
      )
    this.toUpdate.visible = {
      ships: this.visible.ships,
      trails: this.visible.trails || [],
      attackRemnants: this.visible.attackRemnants.map(
        (ar) => ar.stubify(),
      ),
      planets: planetDataToSend,
      caches: this.visible.caches.map((c) =>
        this.cacheToValidScanResult(c),
      ),
      zones: this.visible.zones.map((z) => z.stubify()),
    }
  }

  takeActionOnVisibleChange(
    previousVisible,
    currentVisible,
  ) {
    if (!this.planet) {
      const newlyVisiblePlanets =
        currentVisible.planets.filter(
          (p) => !previousVisible.planets.includes(p),
        )
      newlyVisiblePlanets.forEach((p: Planet) => {
        c.log(`newly visible planet`, this.name, p.name)
        setTimeout(() => {
          p.broadcastTo(this)
        }, Math.random() * 15 * 60 * 1000) // sometime within 15 minutes
      })
    }
  }

  async updatePlanet(silent?: boolean) {
    const previousPlanet = this.planet
    this.planet =
      this.game.planets.find((p) =>
        this.isAt(p.location, p.landingRadiusMultiplier),
      ) || false
    if (previousPlanet !== this.planet) {
      this.toUpdate.planet = this.planet
        ? this.planet.stubify()
        : false

      if (this.planet) {
        // * landed!
        this.hardStop()
        this.planet.rooms.forEach((r) => this.addRoom(r))
        this.planet.passives.forEach((p) =>
          this.applyPassive(p),
        )
        this.planet.addStat(`shipsLanded`, 1)
      } else if (previousPlanet) {
        previousPlanet.rooms.forEach((r) =>
          this.removeRoom(r),
        )
        previousPlanet.passives.forEach((p) =>
          this.removePassive(p),
        )
      }
    }

    if (silent) return

    await c.sleep(100) // to resolve the constructor; this.tutorial doesn't exist yet
    // -----  log for you and other ships on that planet when you land/depart -----
    if (
      (!this.tutorial || this.tutorial.step > 0) &&
      this.planet &&
      !previousPlanet
    ) {
      this.logEntry(
        [
          `Landed on`,
          {
            text: this.planet.name,
            color: this.planet.color,
            tooltipData: this.planet.toLogStub() as any,
          },
          `&nospace.`,
        ],
        `high`,
      )
      if (!this.tutorial)
        this.planet.shipsAt.forEach((s) => {
          if (s === this || !s.planet) return
          s.logEntry([
            {
              text: this.name,
              color: this.faction.color,
              tooltipData: this.toLogStub() as any,
            },
            `landed on`,
            {
              text: s.planet.name,
              color: s.planet.color,
              tooltipData: s.planet.toLogStub() as any,
            },
            `&nospace.`,
          ])
        })
    } else if (previousPlanet && !this.planet) {
      this.logEntry([
        `Departed from`,
        {
          text: previousPlanet.name,
          color: previousPlanet.color,
          tooltipData: previousPlanet.toLogStub() as any,
        },
        `&nospace.`,
      ])
      if (previousPlanet && !this.tutorial)
        previousPlanet.shipsAt.forEach((s) => {
          if (s === this || !s.planet) return
          s.logEntry([
            {
              text: this.name,
              color: this.faction.color,
              tooltipData: this.toLogStub() as any,
            },
            `landed on`,
            {
              text: s.planet.name,
              color: s.planet.color,
              tooltipData: s.planet.toLogStub() as any,
            },
            `&nospace.`,
          ])
        })
    }
  }

  getCache(cache: Cache) {
    // apply "amount boost" passive
    const amountBoostPassive =
      this.getPassiveIntensity(`boostDropAmount`)
    if (cache.droppedBy !== this.id && amountBoostPassive)
      cache.contents.forEach(
        (c) => (c.amount += c.amount * amountBoostPassive),
      )

    this.distributeCargoAmongCrew(cache.contents)

    const contentsToLog: LogContent = []
    cache.contents.forEach((cc, index) => {
      contentsToLog.push(
        `${c.r2(cc.amount)}${
          cc.id === `credits` ? `` : ` tons of`
        }`,
      )
      contentsToLog.push({
        text: cc.id,
        color: `var(--cargo)`,
        tooltipData:
          cc.id === `credits`
            ? undefined
            : {
                type: `cargo`,
                id: cc.id,
              },
      })
      if (index < cache.contents.length - 1)
        contentsToLog.push(` and `)
    })
    this.logEntry(
      [
        `Picked up a cache with`,
        ...contentsToLog,
        `inside!${
          cache.message &&
          ` There was a message attached which said, "${cache.message}".`
        }`,
      ],
      `medium`,
    )
    this.game.removeCache(cache)

    this.addStat(`cachesRecovered`, 1)
  }

  notifyZones(startingLocation: CoordinatePair) {
    for (let z of this.visible.zones) {
      const startedInside = c.pointIsInsideCircle(
        z.location,
        startingLocation,
        z.radius,
      )
      const endedInside = c.pointIsInsideCircle(
        z.location,
        this.location,
        z.radius,
      )
      if (startedInside && !endedInside)
        this.logEntry(
          [
            `Exited`,
            {
              text: z.name,
              color: z.color,
              tooltipData: z.stubify(),
            },
            `&nospace.`,
          ],
          `high`,
        )
      if (!startedInside && endedInside)
        this.logEntry(
          [
            `Entered`,
            {
              text: z.name,
              color: z.color,
              tooltipData: z.stubify(),
            },
            `&nospace.`,
          ],
          `high`,
        )
    }
  }

  updateBroadcastRadius() {
    const passiveEffect =
      this.passives
        .filter((p) => p.id === `boostBroadcastRange`)
        .reduce(
          (total, p) => total + (p.intensity || 0),
          0,
        ) + 1
    this.radii.broadcast =
      Math.max(
        c.baseBroadcastRange,
        c.getRadiusDiminishingReturns(
          this.communicators.reduce((total, comm) => {
            const currRadius = comm.repair * comm.range
            return currRadius + total
          }, 0),
          this.communicators.length,
        ),
      ) * passiveEffect
    this.toUpdate.radii = this.radii
  }

  updateThingsThatCouldChangeOnItemChange() {
    super.updateThingsThatCouldChangeOnItemChange()
    this.updateBroadcastRadius()
    this.crewMembers.forEach((c) => c.recalculateAll())
    this.toUpdate._hp = this.hp
    this.toUpdate._maxHp = this._maxHp
  }

  recalculateShownPanels() {
    if (!this.tutorial) this.shownPanels = undefined
    else
      this.shownPanels =
        this.tutorial.currentStep?.shownPanels
    this.toUpdate.shownPanels = this.shownPanels || false
  }

  equipLoadout(
    l: LoadoutId,
    removeExisting = false,
  ): boolean {
    if (removeExisting) this.items = []
    const res = super.equipLoadout(l)
    if (!res) return res
    this.toUpdate.items = this.items
    this.resolveRooms()
    this.updateThingsThatCouldChangeOnItemChange()
    return true
  }

  addCommonCredits(amount: number, member: CrewMember) {
    this.commonCredits += amount
    this.toUpdate.commonCredits = this.commonCredits
    member.addStat(`totalContributedToCommonFund`, amount)

    if (this.commonCredits > 50000)
      this.addTagline(
        `Easy Target`,
        `having 50000 credits in the common fund`,
      )
    else if (this.commonCredits > 200000)
      this.addTagline(
        `Moneybags`,
        `having 200000 credits in the common fund`,
      )
  }

  broadcast(message: string, crewMember: CrewMember) {
    const sanitized = c.sanitize(
      message.replace(/\n/g, ` `),
    ).result

    let range = this.radii.broadcast

    const avgRepair =
      this.communicators.reduce(
        (total, curr) => curr.repair + total,
        0,
      ) / this.communicators.length

    const willSendShips: Ship[] = []

    if (avgRepair > 0.05) {
      crewMember.addXp(`linguistics`, c.baseXpGain * 100)

      for (let otherShip of this.game.ships) {
        if (otherShip === this) continue
        if (otherShip.tutorial) continue
        const distance = c.distance(
          this.location,
          otherShip.location,
        )
        if (distance > range) continue
        willSendShips.push(otherShip)
      }
      for (let otherShip of willSendShips) {
        const distance = c.distance(
          this.location,
          otherShip.location,
        )
        const antiGarble = this.communicators.reduce(
          (total, curr) =>
            curr.antiGarble * curr.repair + total,
          0,
        )
        const crewSkillAntiGarble =
          (crewMember.skills.find(
            (s) => s.skill === `linguistics`,
          )?.level || 0) / 100
        const garbleAmount =
          distance /
          (range + antiGarble + crewSkillAntiGarble)
        const garbled = c.garble(sanitized, garbleAmount)
        const toSend = `${garbled.substring(
          0,
          c.maxBroadcastLength,
        )}`

        // can be a stub, so find the real thing
        const actualShipObject = this.game.ships.find(
          (s) => s.id === otherShip.id,
        )
        if (actualShipObject)
          actualShipObject.receiveBroadcast(
            toSend,
            this,
            garbleAmount,
            willSendShips,
          )
      }
    }

    if (!this.planet) {
      this.visible.planets
        .filter(
          (p) =>
            c.distance(this.location, p.location) < range,
        )
        .forEach((p) => {
          if (
            message
              .toLowerCase()
              .indexOf(p.name.toLowerCase()) > -1
          )
            p.respondTo(message, this)
        })
    }

    this.communicators.forEach((comm) => {
      if (comm.hp > 0) {
        comm.use()
        this.updateBroadcastRadius()
      }
    })

    return willSendShips.length
  }

  receiveBroadcast(
    message: string,
    from: Ship | Planet,
    garbleAmount: number,
    recipients: Ship[],
  ) {
    const distance = c.distance(
      this.location,
      from.location,
    )
    const prefix = `**${
      `species` in from ? from.species.icon : `🪐`
    }${from.name}** says: *(${c.r2(
      distance,
      2,
    )}AU away, ${c.r2(
      Math.min(100, (1 - garbleAmount) * 100),
      0,
    )}% fidelity)*\n`
    io.emit(
      `ship:message`,
      this.id,
      `${prefix}\`${message}\``,
      `broadcast`,
    )

    this.communicators.forEach((comm) => comm.use())
    this.updateBroadcastRadius()
  }

  // ----- room mgmt -----

  resolveRooms() {
    this.rooms = {}
    let roomsToAdd: Set<CrewLocation> = new Set()
    if (this.tutorial)
      this.tutorial.currentStep?.shownRooms?.forEach((r) =>
        roomsToAdd.add(r),
      )
    else {
      roomsToAdd = new Set([`bunk`, `cockpit`, `repair`])
      this.items.forEach((item) => {
        item.rooms.forEach((i) => roomsToAdd.add(i))
      })
    }
    for (let room of roomsToAdd) this.addRoom(room)
  }

  addRoom(room: CrewLocation) {
    if (!(room in this.rooms))
      this.rooms[room] = c.rooms[room]
    this.toUpdate.rooms = this.rooms
  }

  removeRoom(room: CrewLocation) {
    this.crewMembers.forEach((cm) => {
      if (cm.location === room) {
        cm.location = `bunk`
        cm.toUpdate.location = cm.location
      }
    })
    delete this.rooms[room]
    this.toUpdate.rooms = this.rooms
  }

  // ----- items -----
  addItem(itemData: Partial<BaseItemData>): Item | false {
    const item = super.addItem(itemData)
    if (!item) return false

    if (item.type === `scanner`)
      this.updateMaxScanProperties()

    if (!this.rooms) this.rooms = {}
    item.rooms.forEach((room) => {
      if (!(room in this.rooms)) this.addRoom(room)
    })

    return item
  }

  removeItem(item: Item): boolean {
    c.log(`removing item from`, this.name, item.displayName)
    if (item.rooms) {
      item.rooms.forEach((room) => {
        if (
          !this.items.find(
            (otherItem) =>
              otherItem !== item &&
              otherItem.rooms.includes(room),
          )
        )
          this.removeRoom(room)
      })
    }

    const res = super.removeItem(item)
    if (item.type === `scanner`)
      this.updateMaxScanProperties()
    return res
  }

  // ----- crew mgmt -----

  async addCrewMember(
    data: BaseCrewMemberData,
    setupAdd = false,
  ): Promise<CrewMember> {
    // c.log(data, this.id)
    const cm = new CrewMember(data, this)

    // if it is a fully new crew member (and not a temporary ship in the tutorial)
    if (!setupAdd && !this.tutorial) {
      if (this.crewMembers.length > 1)
        this.logEntry(
          `${cm.name} has joined the ship's crew!`,
          `high`,
        )

      await Tutorial.putCrewMemberInTutorial(cm)

      io.to(`user:${cm.id}`).emit(`user:reloadShips`)
    }

    this.crewMembers.push(cm)
    if (!this.captain) this.captain = cm.id
    // c.log(
    //   `gray`,
    //   `Added crew member ${cm.name} to ${this.name}`,
    // )

    if (this.crewMembers.length >= 5)
      this.addTagline(`Guppy`, `having 5 crew members`)
    else if (this.crewMembers.length >= 10)
      this.addTagline(`Schoolin'`, `having 10 crew members`)
    else if (this.crewMembers.length >= 30)
      this.addTagline(`Pod`, `having 30 crew members`)
    else if (this.crewMembers.length >= 100)
      this.addTagline(`Big Fish`, `having 100 crew members`)

    if (!setupAdd) await db.ship.addOrUpdateInDb(this)
    return cm
  }

  get onlyCrewMemberIsInTutorial() {
    // (or, ALL crew members are in tutorials)
    return (
      (this.crewMembers.length === 1 &&
        this.crewMembers[0].tutorialShipId) ||
      this.crewMembers.every((cm) => cm.tutorialShipId)
    )
  }

  removeCrewMember(id: string) {
    const index = this.crewMembers.findIndex(
      (cm) => cm.id === id,
    )
    const cm = this.crewMembers[index]

    if (index === -1) {
      c.log(
        `red`,
        `Attempted to remove crew member that did not exist ${id} from ship ${this.id}`,
      )
      return
    }

    if (this.captain === cm.id) {
      c.log(
        `red`,
        `Attempted to kick the captain from ship ${this.id}`,
      )
      return
    }

    this.crewMembers.splice(index, 1)
    this.logEntry(
      `${cm.name} has been kicked from the crew. The remaining crew members watch forlornly as their icy body drifts by the observation window. `,
      `critical`,
    )
    // * this could be abused to generate infinite money
    // ${cm.name}'s cargo has been distributed amongst the crew.
    // this.distributeCargoAmongCrew([
    //   ...cm.inventory,
    //   { type: `credits`, amount: cm.credits },
    // ])
    db.ship.addOrUpdateInDb(this)
  }

  membersIn = membersIn
  cumulativeSkillIn = cumulativeSkillIn

  distributeCargoAmongCrew(cargo: CacheContents[]) {
    const leftovers: CacheContents[] = []
    cargo.forEach((contents) => {
      let toDistribute = contents.amount
      const canHoldMore = [...this.crewMembers]
      while (canHoldMore.length && toDistribute) {
        const amountForEach =
          toDistribute / canHoldMore.length
        toDistribute = canHoldMore.reduce(
          (total, cm, index) => {
            if (contents.id === `credits`) {
              cm.credits = Math.floor(
                cm.credits + amountForEach,
              )
              cm.toUpdate.credits = cm.credits
            } else {
              const leftOver = cm.addCargo(
                contents.id,
                amountForEach,
              )
              if (leftOver) {
                canHoldMore.splice(index, 1)
                return total + leftOver
              }
              cm.toUpdate.inventory = cm.inventory
            }
            return total
          },
          0,
        )
      }
      if (toDistribute > 1) {
        const existing = leftovers.find(
          (l) => l.id === contents.id,
        )
        if (existing) existing.amount += toDistribute
        else
          leftovers.push({
            id: contents.id,
            amount: toDistribute,
          })
      }
    })
    if (leftovers.length) {
      setTimeout(
        () =>
          this.logEntry([
            `Your crew couldn't hold everything, so`,
            {
              text: `some cargo`,
              tooltipData: {
                type: `cargo`,
                cargo: leftovers,
              },
            },
            `was released as a cache.`,
          ]),
        500,
      )
      this.game.addCache({
        location: [...this.location],
        contents: leftovers,
        droppedBy: this.id,
      })
    }
  }

  // -----

  updateMaxScanProperties() {
    // c.log(`updating max scan properties`, this.name)
    const totalShape: ShipScanDataShape = {
      ...c.baseShipScanProperties,
    }
    for (let scanner of this.scanners) {
      ;(
        Object.keys(
          scanner.shipScanData,
        ) as (keyof ShipScanDataShape)[]
      ).forEach((key) => {
        const value = scanner.shipScanData[key]
        if (!totalShape[key] && value === true)
          (totalShape[key] as boolean) = true
        if (
          totalShape[key] === undefined &&
          Array.isArray(value)
        ) {
          ;(totalShape[key] as Array<string>) = value
        } else if (
          Array.isArray(totalShape[key]) &&
          Array.isArray(value)
        ) {
          for (let s of value) {
            if (
              !(totalShape[key] as Array<string>).includes(
                s,
              )
            )
              (totalShape[key] as Array<string>).push(s)
          }
        }
      })
    }
    this.maxScanProperties = totalShape
  }

  shipToValidScanResult(ship: Ship): ShipStub {
    let scanPropertiesToUse =
      c.distance(this.location, ship.location) <
      this.radii.scan
        ? this.maxScanProperties || c.baseShipScanProperties
        : c.baseShipScanProperties

    // same faction can see a few more properties
    if (ship.faction === this.faction)
      scanPropertiesToUse = {
        ...scanPropertiesToUse,
        ...c.sameFactionShipScanProperties,
      }

    const partialShip: any = {} // sorry to the typescript gods for this one
    ;(
      Object.entries(scanPropertiesToUse) as [
        keyof ShipScanDataShape,
        true | Array<string>,
      ][]
    ).forEach(([key, value]) => {
      if (!ship[key as keyof Ship]) return
      if (
        key === `crewMembers` &&
        ship.passives.find(
          (p) => p.id === `disguiseCrewMemberCount`,
        )
      )
        return
      if (
        key === `chassis` &&
        ship.passives.find(
          (p) => p.id === `disguiseChassisType`,
        )
      )
        return
      if (value === true)
        partialShip[key] = ship[key as keyof Ship]
      if (Array.isArray(value)) {
        if (Array.isArray(ship[key as keyof Ship])) {
          partialShip[key] = (
            ship[key as keyof Ship] as Array<any>
          ).map((el) => {
            const returnVal: any = {}
            Object.keys(el)
              .filter((elKey: any) => value.includes(elKey))
              .forEach((elKey: any) => {
                returnVal[elKey] = el[elKey]
              })
            return returnVal
          })
        } else {
          partialShip[key] = {}
          Object.keys(ship[key as keyof Ship]).forEach(
            (elKey) => {
              if (value.includes(elKey))
                partialShip[key][elKey] = (
                  ship[key as keyof Ship] as any
                )[elKey]
            },
          )
        }
      }
    })
    return partialShip as ShipStub
  }

  cacheToValidScanResult(
    cache: Cache,
  ): Partial<CacheStub> | CacheStub {
    const isInRange =
      c.distance(this.location, cache.location) <=
      this.radii.scan
    const partialStub: Partial<CacheStub> | Cache =
      isInRange
        ? cache.stubify()
        : {
            type: `cache`,
            location: cache.location,
            id: cache.id,
          }
    return partialStub
  }

  // ----- respawn -----

  async respawn(
    silent = false,
  ): Promise<Item[] | undefined> {
    const lostItems = await super.respawn()

    const lostItemValue =
      lostItems?.reduce(
        (total, item) => total + item.baseData.basePrice,
        0,
      ) || 0
    const refundAmount =
      Math.max(0, lostItemValue - 10000) * 0.25
    this.commonCredits = refundAmount

    this.equipLoadout(`humanDefault`)

    this.updatePlanet(true)
    this.toUpdate.dead = Boolean(this.dead)

    this.crewMembers.forEach((cm) => {
      cm.targetLocation = null
      cm.location = `bunk`
    })

    if (!silent && this instanceof HumanShip) {
      this.logEntry(
        `Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`,
        `critical`,
      )
    }

    await db.ship.addOrUpdateInDb(this)
    return []
  }

  // ----- auto attack -----
  autoAttack() {
    const weaponsRoomMembers = this.membersIn(`weapons`)
    if (!weaponsRoomMembers.length) return

    this.toUpdate.targetShip = undefined

    // ----- gather most common tactic -----

    const tacticCounts = weaponsRoomMembers.reduce(
      (totals: any, cm) => {
        const currTotal = totals.find(
          (t: any) => t.tactic === cm.tactic,
        )
        const toAdd =
          cm.skills.find((s) => s.skill === `munitions`)
            ?.level || 1
        if (currTotal) currTotal.total += toAdd
        else
          totals.push({ tactic: cm.tactic, total: toAdd })
        return totals
      },
      [],
    )
    const mainTactic = tacticCounts.sort(
      (b: any, a: any) => b.total - a.total,
    )?.[0]?.tactic as Tactic | undefined

    this.mainTactic = mainTactic
    this.toUpdate.mainTactic = mainTactic

    const attackableShips = this.getEnemiesInAttackRange()
    this.toUpdate.enemiesInAttackRange =
      attackableShips.map((s) => s.stubify())

    // ----- gather most common item target -----

    const itemTargetCounts = weaponsRoomMembers.reduce(
      (totals: any, cm) => {
        if (!cm.itemTarget) return totals
        const currTotal = totals.find(
          (t: any) => t.itemTarget === cm.itemTarget,
        )
        const toAdd =
          cm.skills.find((s) => s.skill === `munitions`)
            ?.level || 1
        if (currTotal) currTotal.total += toAdd
        else
          totals.push({
            target: cm.itemTarget,
            total: toAdd,
          })
        return totals
      },
      [],
    )
    let mainItemTarget = itemTargetCounts.sort(
      (b: any, a: any) => b.total - a.total,
    )?.[0]?.target as ItemType | undefined
    this.itemTarget = mainItemTarget
    this.toUpdate.itemTarget = mainItemTarget

    if (!mainTactic) return
    if (!attackableShips.length) return

    const availableWeapons = this.availableWeapons()
    if (!availableWeapons) return

    // ----- gather most common attack target -----

    const shipTargetCounts = weaponsRoomMembers
      .reduce(
        (
          totals: { target: CombatShip; total: number }[],
          cm,
        ) => {
          if (!cm.attackTarget) return totals
          const currTotal = totals.find(
            (t) => t.target === cm.attackTarget,
          )
          const toAdd =
            cm.skills.find((s) => s.skill === `munitions`)
              ?.level || 1
          if (currTotal) currTotal.total += toAdd
          else
            totals.push({
              target: cm.attackTarget,
              total: toAdd,
            })
          return totals
        },
        [],
      )
      .map((totalEntry) => {
        if (!this.canAttack(totalEntry.target))
          totalEntry.total -= 1000 // disincentive for ships out of range, etc, but still possible to end up with them if they're the only ones targeted
        return totalEntry
      })
    const mainAttackTarget = shipTargetCounts.sort(
      (b: any, a: any) => b.total - a.total,
    )?.[0]?.target as CombatShip | undefined

    // ----- defensive strategy -----

    if (mainTactic === `defensive`) {
      let targetShip: CombatShip | undefined
      if (
        mainAttackTarget &&
        this.canAttack(mainAttackTarget)
      ) {
        const attackedByThatTarget =
          this.visible.attackRemnants.find(
            (ar) => ar.attacker === mainAttackTarget,
          )
        if (attackedByThatTarget)
          targetShip = mainAttackTarget
      } else {
        const mostRecentDefense =
          this.visible.attackRemnants
            .filter(
              (ar) =>
                ar.attacker.id !== this.id &&
                !ar.attacker.dead,
            )
            .reduce(
              (
                mostRecent: AttackRemnant | null,
                ar,
              ): AttackRemnant | null =>
                mostRecent &&
                mostRecent.time > ar.time &&
                this.canAttack(mostRecent.attacker)
                  ? mostRecent
                  : ar,
              null,
            )
        targetShip = mostRecentDefense?.attacker
      }
      // c.log(`defensive, targeting`, targetShip?.name)
      if (!targetShip) return
      if (!targetShip.stubify)
        // in some cases we end up with a stub here
        targetShip = this.game.ships.find(
          (s) => s.attackable && s.id === targetShip?.id,
        ) as CombatShip
      this.toUpdate.targetShip = targetShip
        ? targetShip.stubify()
        : undefined
      if (targetShip)
        availableWeapons.forEach((w) => {
          this.attack(targetShip!, w, mainItemTarget)
        })
    }

    // ----- aggressive strategy -----

    if (mainTactic === `aggressive`) {
      let targetShip = mainAttackTarget
      if (targetShip && !this.canAttack(targetShip))
        targetShip = undefined

      if (!targetShip) {
        // ----- if no attack target, pick the one we were most recently in combat with that's still in range -----
        const mostRecentCombat =
          this.visible.attackRemnants.reduce(
            (
              mostRecent: AttackRemnant | null,
              ar,
            ): AttackRemnant =>
              mostRecent &&
              mostRecent.time > ar.time &&
              this.canAttack(
                mostRecent.attacker.id === this.id
                  ? mostRecent.defender
                  : mostRecent.attacker,
              )
                ? mostRecent
                : ar,
            null,
          )
        if (mostRecentCombat)
          targetShip =
            mostRecentCombat.attacker.id === this.id
              ? mostRecentCombat.defender
              : mostRecentCombat.attacker

        // ----- if there is enemy from recent combat that we can hit, just pick the closest enemy -----
        if (!targetShip)
          targetShip = attackableShips.reduce(
            (
              closest: CombatShip | undefined,
              curr: CombatShip,
            ) => {
              if (
                !closest ||
                c.distance(this.location, curr.location) <
                  c.distance(
                    this.location,
                    closest.location,
                  )
              )
                return curr
              return closest
            },
            undefined,
          )
      }

      // ----- attack with EVERY AVAILABLE WEAPON -----
      if (!targetShip) return
      if (!targetShip.stubify)
        // in some cases we end up with a stub here
        targetShip = this.game.ships.find(
          (s) => s.attackable && s.id === targetShip?.id,
        ) as CombatShip
      this.toUpdate.targetShip = targetShip?.stubify()
      if (targetShip) {
        availableWeapons.forEach((w) => {
          this.attack(targetShip!, w, mainItemTarget)
        })
      } else this.toUpdate.targetShip = undefined
    }
  }

  die(attacker?: CombatShip) {
    super.die(attacker)

    setTimeout(() => {
      this.logEntry(
        `Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`,
        `critical`,
      )

      this.addTagline(
        `Delicious with Lemon`,
        `having your ship destroyed`,
      )

      if (
        this.stats.find((s) => s.stat === `deaths`)
          ?.amount === 2
      )
        this.addHeaderBackground(
          `Gravestone 1`,
          `having your ship destroyed twice`,
        )
    }, 100)

    const cacheContents: CacheContents[] = []

    this.crewMembers.forEach((cm) => {
      // ----- crew member cargo -----
      while (cm.inventory.length) {
        const toAdd = cm.inventory.pop()
        const existing = cacheContents.find(
          (cc) => cc.id === toAdd?.id,
        )
        if (existing) existing.amount += toAdd?.amount || 0
        else if (toAdd) cacheContents.push(toAdd)
      }

      // ----- crew member credits -----
      const toCache =
        cm.credits *
        CombatShip.percentOfCreditsDroppedOnDeath
      cm.credits -=
        cm.credits * CombatShip.percentOfCreditsLostOnDeath
      const existing = cacheContents.find(
        (cc) => cc.id === `credits`,
      )
      if (existing) existing.amount += toCache || 0
      else if (cm.credits)
        cacheContents.push({
          id: `credits`,
          amount: toCache,
        })

      cm.location = `bunk`
      cm.stamina = 0
    })

    // ----- ship common credits -----
    const toCache =
      this.commonCredits *
      CombatShip.percentOfCreditsDroppedOnDeath
    this.commonCredits -=
      this.commonCredits *
      CombatShip.percentOfCreditsLostOnDeath
    const existing = cacheContents.find(
      (cc) => cc.id === `credits`,
    )
    if (existing) existing.amount += toCache || 0
    else if (this.commonCredits)
      cacheContents.push({
        id: `credits`,
        amount: toCache,
      })

    if (cacheContents.length)
      this.game.addCache({
        contents: cacheContents,
        location: this.location,
        message: `Remains of ${this.name}`,
      })
  }

  get factionRankings() {
    return this.game.factionRankings
  }
}
