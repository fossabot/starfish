import c from '../../../../../common/dist'
import { db } from '../../../db'
import io from '../../../server/io'

import { membersIn, cumulativeSkillIn } from './addins/crew'
import {
  checkAchievements,
  addAchievement,
} from './addins/achievements'

import defaultGameSettings from '../../presets/gameSettings'

import { CombatShip } from './CombatShip'
import type { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import type { AttackRemnant } from '../AttackRemnant'
import type { Planet } from '../Planet/Planet'
import type { Comet } from '../Planet/Comet'
import type { Cache } from '../Cache'
import type { Ship } from './Ship'
import type { Zone } from '../Zone'
import type { Item } from '../Item/Item'

import { Tutorial } from './addins/Tutorial'

interface HumanVisibleShape {
  ships: ShipStub[]
  planets: Planet[]
  caches: Cache[]
  attackRemnants: (AttackRemnant | AttackRemnantStub)[]
  trails?: {
    color?: string
    points: CoordinatePair[]
  }[]
  zones: Zone[]
}

export class HumanShip extends CombatShip {
  static maxLogLength = 40
  static movementIsFree = false // true
  static secondWindStartHp = 2
  static secondWindEndHp = 3.5
  static secondWindPassives: CrewPassiveData[] = [
    {
      id: `reduceStaminaDrain`,
      intensity: 0.4,
      data: { source: `secondWind` },
    },
    {
      id: `boostBroadcastRange`,
      intensity: 0.3,
      data: { source: `secondWind` },
    },
    {
      id: `generalImprovementPerCrewMemberInSameRoom`,
      intensity: 0.05,
      data: { source: `secondWind` },
    },
  ]

  readonly id: string
  guildName: string = `guild`
  guildIcon: string | undefined

  log: LogEntry[] = []
  logAlertLevel: LogAlertLevel = `medium`
  readonly crewMembers: CrewMember[] = []
  captain: string | null = null
  rooms: { [key in CrewLocation]?: BaseRoomData } = {}
  maxScanProperties: ShipScanDataShape | null = null
  secondWind: boolean = false
  banked: BankEntry[] = []

  combatTactic: CombatTactic = `pacifist`
  idealTargetShip: CombatShip | null = null

  visible: {
    ships: ShipStub[]
    planets: Planet[]
    comets: Comet[]
    caches: Cache[]
    attackRemnants: (AttackRemnant | AttackRemnantStub)[]
    trails?: { color?: string; points: CoordinatePair[] }[]
    zones: Zone[]
  } = {
    ships: [],
    planets: [],
    comets: [],
    caches: [],
    attackRemnants: [],
    zones: [],
  }

  shownPanels?: any[]

  commonCredits: number = 0
  orders: ShipOrders | false = false
  orderReactions: ShipOrderReaction[] = []

  tutorial: Tutorial | undefined = undefined

  seenCrewMembers: string[] = []

  constructor(
    data: BaseHumanShipData = {} as BaseHumanShipData,
    game?: Game,
  ) {
    super(data, game)
    this.id = data.id

    if (data.guildName) this.guildName = data.guildName
    if (data.guildIcon) this.guildIcon = data.guildIcon

    this.ai = false
    this.human = true

    this.seenCrewMembers = data.seenCrewMembers || []

    this.banked = data.banked || []

    this.speed = c.vectorToMagnitude(this.velocity)
    this.toUpdate.speed = this.speed
    this.direction = c.vectorToDegrees(this.velocity)
    this.toUpdate.direction = this.direction

    this.captain = data.captain || null
    this.orders = data.orders || false
    this.log = data.log || []
    this.orderReactions = data.orderReactions || []

    if (data.tutorial && data.tutorial.step !== undefined) {
      this.tutorial = new Tutorial(data.tutorial, this)
      this.tagline = `📚 Tutorial Ship`
    }

    if (data.achievements)
      this.addAchievement(data.achievements, true)

    // human ships always know where their homeworld is
    const homeworld = this.game?.getHomeworld(this.guildId)
    if (
      homeworld &&
      !this.seenPlanets.find((p) => p === homeworld)
    )
      this.discoverPlanet(homeworld)

    // non-guild ships always know where all guild homeworlds are
    for (let guildId of Object.keys(c.guilds)) {
      const homeworld = this.game?.getHomeworld(
        guildId as GuildId,
      )
      if (
        homeworld &&
        !this.seenPlanets.find((p) => p === homeworld)
      )
        this.discoverPlanet(homeworld)
    }

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
                color: this.guildId
                  ? c.guilds[this.guildId].color
                  : undefined,
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

    this.checkAchievements()

    this.updatePlanet(true)
    if (this.tutorial)
      setTimeout(() => this.updatePlanet(true), 1500)

    if (!this.items.length) {
      c.log(
        `red`,
        `Attempted to spawn a human ship with no items!`,
        data.name,
        data.items,
      )
      this.equipLoadout(`humanDefault`)
    }

    setTimeout(() => {
      this.radii.gameSize = this.game?.gameSoftRadius || 1
      this.toUpdate.radii = this.radii

      // give all the AI a chance to spawn and become visible
      this.updateVisible()
      this.recalculateTargetItemType()
      this.recalculateCombatTactic()
    }, 100)
  }

  checkAchievements = checkAchievements
  addAchievement = addAchievement

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
    this.updatePlanet()

    // ----- planet effects -----
    if (this.planet) this.planet.tickEffectsOnShip(this)

    profiler.step(`update visible`)
    // ----- scan -----
    const previousVisible = { ...this.visible }
    this.updateVisible()
    this.takeActionOnVisibleChange(
      previousVisible,
      this.visible,
    )
    this.scanners.forEach((s) => s.use())
    this.generateVisiblePayload(previousVisible)

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

    // ----- auto-repair -----
    const autoRepairIntensity =
      (this.getPassiveIntensity(`autoRepair`) / // comes in per hour, we need per tick
        60 /
        60 /
        1000) *
      c.tickInterval
    if (autoRepairIntensity)
      this.repair(autoRepairIntensity)

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

    // ----- second wind -----
    if (
      this.secondWind &&
      this._hp > HumanShip.secondWindEndHp
    ) {
      this.secondWind = false
      this.crewMembers.forEach((cm) =>
        HumanShip.secondWindPassives.forEach((p) =>
          cm.removePassive(p),
        ),
      )
      this.logEntry(
        `The crew's second wind wears off.`,
        `low`,
      )
    } else if (
      !this.secondWind &&
      this._hp <= HumanShip.secondWindStartHp
    ) {
      this.secondWind = true
      this.crewMembers.forEach((cm) =>
        HumanShip.secondWindPassives.forEach((p) =>
          cm.applyPassive(p),
        ),
      )
      this.logEntry(
        [
          `${this.name} has dropped below`,
          {
            text: `${HumanShip.secondWindStartHp} HP`,
            color: `var(--warning)`,
          },
          `&nospace! The crew has gained a second wind!`,
        ],
        `high`,
      )
    }

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

    if (this.tutorial) return

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
            tooltipData: p.toReference() as any,
          },
          `&nospace!`,
        ],
        `high`,
      )

    this.addStat(`seenPlanets`, 1)

    this.checkAchievements(`exploration`)
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
            tooltipData: l.toReference() as any,
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
  ): number {
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
      (this.game?.settings.baseXpGain ||
        defaultGameSettings().baseXpGain) *
        2000 *
        charge *
        thruster.cockpitCharge *
        xpBoostMultiplier,
    )
    thruster.active()

    const thrustBoostPassiveMultiplier =
      thruster.getPassiveIntensity(`boostThrust`) + 1

    charge *= thruster.cockpitCharge
    charge *= thrustBoostPassiveMultiplier

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
        ) *
        (this.game?.settings.baseEngineThrustMultiplier ||
          defaultGameSettings().baseEngineThrustMultiplier),
    )
    const magnitudePerPointOfCharge =
      c.getThrustMagnitudeForSingleCrewMember(
        memberPilotingSkill,
        engineThrustMultiplier,
        this.game?.settings.baseEngineThrustMultiplier ||
          defaultGameSettings().baseEngineThrustMultiplier,
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

      if (isNaN(angleToThrustInDegrees)) return 0

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
          (this.game?.settings.arrivalThreshold ||
            defaultGameSettings().arrivalThreshold),
      )
      if (foundPlanet)
        targetData = [
          {
            text: foundPlanet.name,
            color: foundPlanet.color,
            tooltipData: foundPlanet.toReference() as any,
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
              tooltipData:
                foundLandmark.toReference() as any,
            },
          ]
      }
      if (!targetData) {
        const foundShip = this.visible.ships.find(
          (s) =>
            c.distance(s.location, targetLocation) <
            (this.game?.settings.arrivalThreshold ||
              defaultGameSettings().arrivalThreshold) *
              5,
        )
        if (foundShip) {
          const fullShip = this.game?.ships.find(
            (s) => s.id === foundShip.id,
          )
          if (fullShip)
            targetData = [
              `the ship`,
              {
                text: fullShip.name,
                color: fullShip.guildId
                  ? c.guilds[fullShip.guildId].color
                  : undefined,
                tooltipData: fullShip.toReference() as any,
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
          `at ${c.speedNumber(
            c.vectorToMagnitude(thrustVector) * 60 * 60,
          )}.`,
        ],
        `low`,
      )
    }

    if (!HumanShip.movementIsFree)
      this.engines.forEach((e) => e.use(charge, [thruster]))

    thruster.addStat(
      `totalSpeedApplied`,
      c.vectorToMagnitude(thrustVector) * 60 * 60,
    )

    return c.vectorToMagnitude(thrustVector) * 60 * 60
  }

  brake(charge: number, thruster: CrewMember): number {
    // add xp
    const xpBoostMultiplier =
      (this.passives.find((p) => p.id === `boostXpGain`)
        ?.intensity || 0) + 1
    thruster.addXp(
      `piloting`,
      (this.game?.settings.baseXpGain ||
        defaultGameSettings().baseXpGain) *
        2000 *
        charge *
        thruster.cockpitCharge *
        xpBoostMultiplier,
    )
    thruster.active()

    charge *= thruster.cockpitCharge
    if (!HumanShip.movementIsFree)
      thruster.cockpitCharge -= charge

    charge *=
      this.game?.settings.brakeToThrustRatio ||
      defaultGameSettings().brakeToThrustRatio // braking is easier than thrusting

    // apply passive
    let passiveBrakeMultiplier =
      1 +
      this.getPassiveIntensity(`boostBrake`) +
      thruster.getPassiveIntensity(`boostBrake`)
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
        ) *
        (this.game?.settings.baseEngineThrustMultiplier ||
          defaultGameSettings().baseEngineThrustMultiplier),
    )
    const magnitudePerPointOfCharge =
      c.getThrustMagnitudeForSingleCrewMember(
        memberPilotingSkill,
        engineThrustMultiplier,
        this.game?.settings.baseEngineThrustMultiplier ||
          defaultGameSettings().baseEngineThrustMultiplier,
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
          `braked, slowing the ship by ${c.speedNumber(
            (this.speed - currentMagnitude) * 60 * 60 * -1,
          )}.`,
        ],
        `low`,
      )

    if (!HumanShip.movementIsFree)
      this.engines.forEach((e) => e.use(charge, [thruster]))

    thruster.addStat(
      `totalSpeedApplied`,
      (this.speed - currentMagnitude) * 60 * 60 * -1,
    )

    return (this.speed - currentMagnitude) * 60 * 60 * -1
  }

  // ----- move -----
  move(toLocation?: CoordinatePair) {
    const startingLocation: CoordinatePair = [
      ...this.location,
    ]

    super.move(toLocation)

    if (toLocation) {
      this.updateVisible()
      this.updatePlanet()
      this.addPreviousLocation(
        startingLocation,
        this.location,
      )
      return
    }

    if (!this.canMove) {
      this.hardStop()
      return
    }

    if (this.velocity[0] === 0 && this.velocity[1] === 0)
      return

    this.location[0] += this.velocity[0]
    this.location[1] += this.velocity[1]
    this.toUpdate.location = this.location

    this.game?.chunkManager.addOrUpdate(
      this,
      startingLocation,
    )

    this.addPreviousLocation(
      startingLocation,
      this.location,
    )

    this.notifyZones(startingLocation)

    this.addStat(
      `distanceTraveled`,
      c.distance(startingLocation, this.location),
    )

    const speed =
      (c.vectorToMagnitude(this.velocity) *
        (1000 * 60 * 60)) /
      c.tickInterval
    if (speed > this.getStat(`highestSpeed`))
      this.setStat(`highestSpeed`, speed)
    this.checkAchievements(`speed`)

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
    this.radii.gameSize = this.game?.gameSoftRadius || 1
    this.toUpdate.radii = this.radii
    const isOutsideRadius =
      c.distance([0, 0], this.location) >
      (this.game?.gameSoftRadius || 1)
    const startedOutsideRadius =
      c.distance([0, 0], startingLocation) >
      (this.game?.gameSoftRadius || 1)
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
    if (c.lottery(distanceTraveled, 2)) {
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
      c.lottery(distanceTraveled, 5)
    ) {
      if (
        Math.random() > 0.1 &&
        Math.random() > this.chassis.agility * 0.5
      ) {
        const damage =
          this._maxHp * c.randomBetween(0.01, 0.15)
        this.takeDamage(
          { name: `an asteroid` },
          {
            damage,
            miss: false,
            targetType: `any`,
          },
        )
      }
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
    const alwaysShowTrailColors = this.passives.find(
      (p) => p.id === `alwaysSeeTrailColors`,
    )
    const visible = this.game?.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      targetTypes,
      alwaysShowTrailColors ? `withColors` : true,
      Boolean(this.tutorial),
    ) || {
      ships: [],
      planets: [],
      zones: [],
      caches: [],
      attackRemnants: [],
      comets: [],
    }
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
    comets: Comet[]
    caches: Cache[]
    attackRemnants: (AttackRemnant | AttackRemnantStub)[]
    trails?: { color?: string; points: CoordinatePair[] }[]
    zones: Zone[]
  }) {
    let planetDataToSend: Partial<PlanetStub>[] = []
    // send newly visible planets (only once)
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
      comets: (this.visible.comets || []).map((p) =>
        p.toVisibleStub(),
      ),
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
    previousVisible: HumanVisibleShape,
    currentVisible: HumanVisibleShape,
  ) {
    if (!this.planet) {
      const newlyVisiblePlanets =
        currentVisible.planets.filter(
          (p) => !previousVisible.planets.includes(p),
        )
      newlyVisiblePlanets.forEach((p: Planet) => {
        // c.log(`newly visible planet`, this.name, p.name)
        setTimeout(() => {
          p.broadcastTo(this)
        }, Math.random() * 15 * 60 * 1000) // sometime within 15 minutes
      })
    }

    // if target leaves range/attackability, choose a new target
    if (
      this.targetShip &&
      !this.canAttack(this.targetShip, true)
    ) {
      this.determineTargetShip()
    }
    // if the most "voted" ship comes into range/attackability, switch to it
    else if (
      this.idealTargetShip &&
      this.idealTargetShip !== this.targetShip &&
      this.canAttack(this.idealTargetShip, true) &&
      this.combatTactic !== `defensive` // defensive tactic waits until being attacked to switch
    ) {
      this.determineTargetShip()
    }
  }

  async updatePlanet(silent?: boolean) {
    const previousPlanet = this.planet
    if (
      !this.planet ||
      !this.isAt(
        this.planet.location,
        this.planet.landingRadiusMultiplier,
      )
    )
      this.planet =
        this.visible.comets.find((p) =>
          this.isAt(p.location, p.landingRadiusMultiplier),
        ) ||
        this.seenPlanets.find((p) =>
          this.isAt(p.location, p.landingRadiusMultiplier),
        ) ||
        false

    if (previousPlanet == this.planet) return

    this.toUpdate.planet = this.planet
      ? this.planet.stubify()
      : false

    // c.log(
    //   this.id,
    //   Boolean(this.planet),
    //   this.seenPlanets.length,
    //   this.visible.planets.length,
    // )

    if (this.planet) {
      // * landed!
      if (!silent)
        c.log(
          `gray`,
          `${this.name} landed at ${this.planet.name}`,
        )

      this.hardStop()
      this.planet.rooms.forEach((r) => this.addRoom(r))
      this.planet.passives.forEach((p) =>
        this.applyPassive(p),
      )
      this.planet.addStat(`shipsLanded`, 1)
      this.checkAchievements(`land`)
    } else if (previousPlanet) {
      c.log(
        `gray`,
        `${this.name} departed from ${
          previousPlanet ? previousPlanet.name : ``
        }`,
      )

      previousPlanet.rooms.forEach((r) =>
        this.removeRoom(r),
      )
      previousPlanet.passives.forEach((p) =>
        this.removePassive(p),
      )
    }

    if (silent) return

    await c.sleep(1) // to resolve the constructor; this.tutorial doesn't exist yet

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
            tooltipData: this.planet.toReference() as any,
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
              color: this.guildId
                ? c.guilds[this.guildId].color
                : undefined,
              tooltipData: this.toReference() as any,
            },
            `landed on`,
            {
              text: s.planet.name,
              color: s.planet.color,
              tooltipData: s.planet.toReference() as any,
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
          tooltipData: previousPlanet.toReference() as any,
        },
        `&nospace.`,
      ])
      if (previousPlanet && !this.tutorial)
        previousPlanet.shipsAt.forEach((s) => {
          if (s === this || !s.planet) return
          s.logEntry([
            {
              text: this.name,
              color: this.guildId
                ? c.guilds[this.guildId].color
                : undefined,
              tooltipData: this.toReference() as any,
            },
            `landed on`,
            {
              text: s.planet.name,
              color: s.planet.color,
              tooltipData: s.planet.toReference() as any,
            },
            `&nospace.`,
          ])
        })
    }
  }

  depositInBank(amount: number) {
    const planet = this.planet
    if (!planet) return

    if (amount > this.commonCredits)
      amount = this.commonCredits

    this.commonCredits -= c.r2(amount, 0, true)
    this.toUpdate.commonCredits = this.commonCredits

    const existing = this.banked.find(
      (e) => e.id === planet.id,
    )
    if (existing) existing.amount += amount
    else
      this.banked.push({
        id: planet.id,
        amount,
        timestamp: Date.now(),
      })
    this.toUpdate.banked = this.banked

    this.logEntry(
      [
        `${c.r2(amount)} credits deposited in the bank at`,
        {
          text: planet.name,
          color: planet.color,
          tooltipData: planet.toReference() as any,
        },
        `&nospace.`,
      ],
      `low`,
    )
  }

  withdrawFromBank(amount: number) {
    const planet = this.planet
    if (!planet) return

    const entry = this.banked.find(
      (e) => e.id === planet.id,
    )
    if (!entry) return
    if (entry.amount < amount) amount = entry.amount
    entry.amount -= c.r2(amount, 0, true)

    this.commonCredits += amount
    this.toUpdate.commonCredits = this.commonCredits

    this.banked = this.banked.filter((e) => e.amount >= 1)
    this.toUpdate.banked = this.banked

    this.logEntry(
      [
        `${c.r2(
          amount,
        )} credits withdrawn from the bank at`,
        {
          text: planet.name,
          color: planet.color,
          tooltipData: planet.toReference() as any,
        },
        `&nospace.`,
      ],
      `low`,
    )
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
    this.game?.removeCache(cache)

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
              tooltipData: z.toReference(),
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
              tooltipData: z.toReference(),
            },
            `&nospace.`,
          ],
          `high`,
        )
    }
  }

  updateBroadcastRadius() {
    if (this.tutorial) {
      this.radii.broadcast = 0
      this.toUpdate.radii = this.radii

      return
    }
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
    this.toUpdate.items = [
      ...this.items.map((i) => i.stubify()),
    ] as ItemStub[]
    this.resolveRooms()
    this.updateThingsThatCouldChangeOnItemChange()
    return true
  }

  addCommonCredits(amount: number, member: CrewMember) {
    this.commonCredits += amount
    this.toUpdate.commonCredits = this.commonCredits

    if (amount > 100)
      this.logEntry(
        `${member.name} added ${c.r2(
          amount,
          0,
        )} credits to the ship's common fund.`,
        `low`,
      )

    member.addStat(`totalContributedToCommonFund`, amount)
  }

  broadcast(message: string, crewMember: CrewMember) {
    const sanitized = c.sanitize(
      message.replace(/\n/g, ` `),
    ).result

    let range =
      this.radii.broadcast *
      (crewMember.getPassiveIntensity(
        `boostBroadcastRange`,
      ) +
        1)

    const avgRepair =
      this.communicators.reduce(
        (total, curr) => curr.repair + total,
        0,
      ) / this.communicators.length

    const willSendShips: Ship[] = []

    if (avgRepair > 0.05) {
      crewMember.addXp(
        `linguistics`,
        (this.game?.settings.baseXpGain ||
          defaultGameSettings().baseXpGain) * 100,
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

      // todo use chunks
      for (let otherShip of this.game?.ships || []) {
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

        const garbleAmount =
          distance /
          (range + antiGarble + crewSkillAntiGarble)
        const garbled = c.garble(sanitized, garbleAmount)
        const toSend = `${garbled.substring(
          0,
          c.maxBroadcastLength,
        )}`

        // can be a stub, so find the real thing
        const actualShipObject = (
          this.game?.ships || []
        ).find((s) => s.id === otherShip.id)
        if (actualShipObject)
          actualShipObject.receiveBroadcast(
            actualShipObject.ai ? message : toSend,
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
        comm.use(1, [crewMember])
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
    const prefix = `**${from.name}** says: *(${c.r2(
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

    // * this was annoying and not useful
    // this.communicators.forEach((comm) => comm.use())
    // this.updateBroadcastRadius()
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
    if (!this.seenCrewMembers.includes(data.id)) {
      data.credits = 1000
      this.seenCrewMembers.push(data.id)
    }

    const cm = new CrewMember(data, this)

    // if it is a fully new crew member (and not a temporary ship in the tutorial)
    if (!setupAdd && !this.tutorial) {
      if (this.crewMembers.length > 0)
        this.logEntry(
          `${cm.name} has joined the ship's crew!`,
          `high`,
        )

      // if this crew member has already done the tutorial in another ship, skip it
      const foundInOtherShip = (
        this.game?.humanShips || []
      ).find((s) =>
        s.crewMembers.find(
          (otherCm) => otherCm.id === cm.id,
        ),
      )
      if (!foundInOtherShip)
        await Tutorial.putCrewMemberInTutorial(cm)
      // BUT, if they are the first crew member, still send the tutorial-end messages
      else if (this.crewMembers.length === 0)
        Tutorial.endMessages(this)

      io.to(`user:${cm.id}`).emit(`user:reloadShips`)
    }

    this.crewMembers.push(cm)
    if (!this.captain) {
      this.captain = cm.id

      if (
        [
          `244651135984467968`,
          `395634705120100367`,
          `481159946197794816`,
        ].includes(cm.id)
      )
        this.addAchievement(`admin`)
    }

    if (!setupAdd)
      c.log(
        `gray`,
        `Added crew member ${cm.name} to ${this.name}`,
      )

    this.checkAchievements(`crewMembers`)

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

  async removeCrewMember(id: string, force = false) {
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
      if (force) {
        // set someone random to captain if we deleted the captain by force
        const anyoneElse = this.crewMembers.find(
          (cm) => cm.id !== id,
        )
        if (anyoneElse) {
          this.captain = anyoneElse.id
          this.toUpdate.captain = anyoneElse.id
        }
      } else {
        c.log(
          `red`,
          `Attempted to kick the captain from ship ${this.id}`,
        )
        return
      }
    }

    this.crewMembers.splice(index, 1)
    io.to(`ship:${this.id}`).emit(`ship:reload`)

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

    await db.ship.addOrUpdateInDb(this)
    if (this.crewMembers.length === 0) {
      c.log(
        `Removed last crew member from ${this.name}, deleting ship...`,
      )
      await this.game?.removeShip(this)
    }
  }

  membersIn = membersIn
  cumulativeSkillIn = cumulativeSkillIn

  distributeCargoAmongCrew(cargo: CacheContents[]) {
    const leftovers: CacheContents[] = []

    cargo.forEach((contents) => {
      let toDistribute = contents.amount
      let canHoldMore = [...this.crewMembers]

      while (canHoldMore.length && toDistribute) {
        const newCanHoldMore = [...canHoldMore]
        const amountForEach =
          toDistribute / canHoldMore.length

        toDistribute = 0

        canHoldMore.forEach((cm, index) => {
          const amountToGive =
            amountForEach *
            (cm.getPassiveIntensity(`boostDropAmounts`) + 1)
          // unweighted cargo
          if (contents.id === `credits`) {
            cm.credits = Math.floor(
              cm.credits + amountToGive,
            )
            cm.toUpdate.credits = cm.credits
          }
          // normal weighted cargo
          else {
            const leftOver = cm.addCargo(
              contents.id,
              amountToGive,
            )
            if (leftOver) {
              newCanHoldMore.splice(
                newCanHoldMore.indexOf(cm),
                1,
              )
              toDistribute += leftOver
            }
            cm.toUpdate.inventory = cm.inventory
          }
        })
        canHoldMore = newCanHoldMore
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

      this.game?.addCache({
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

    // same guild can see a few more properties
    if (ship.guildId && ship.guildId === this.guildId)
      scanPropertiesToUse = {
        ...scanPropertiesToUse,
        ...c.sameGuildShipScanProperties,
      }

    const partialShip: any = {} // sorry to the typescript gods for this one
    ;(
      Object.entries(scanPropertiesToUse) as [
        keyof ShipScanDataShape,
        true | Array<string>,
      ][]
    ).forEach(([key, value]) => {
      if (ship[key as keyof Ship] === undefined) return
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
      if (key === `items` && Array.isArray(value)) {
        partialShip.items = ship.items.map((i) => {
          const partialItem = {}
          for (let prop of value) {
            partialItem[prop] = i[prop]
          }
          return partialItem
        })
        return
      }
      if (key === `rooms`) {
        partialShip.rooms = Object.keys(
          (ship as HumanShip).rooms || {},
        )
        return
      }
      if (value === true) {
        partialShip[key] =
          typeof ship[key as keyof Ship] === `object`
            ? c.stubify(ship[key as keyof Ship])
            : ship[key as keyof Ship]
        return
      }
      if (Array.isArray(value)) {
        if (Array.isArray(ship[key as keyof Ship])) {
          partialShip[key] = (
            ship[key as keyof Ship] as Array<any>
          ).map((el) => {
            const returnVal: any = []
            Object.keys(el)
              .filter((elKey: any) => value.includes(elKey))
              .forEach((elKey: any) => {
                returnVal.push(el[elKey])
              })
            return c.stubify(returnVal)
          })
        } else if (ship[key as keyof Ship]) {
          partialShip[key] = {}
          Object.keys(ship[key as keyof Ship]).forEach(
            (elKey) => {
              if (value.includes(elKey))
                partialShip[key][elKey] = c.stubify(
                  (ship[key as keyof Ship] as any)[elKey],
                )
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

  async respawn(silent = false) {
    await super.respawn()

    this.equipLoadout(`humanDefault`)

    this.updatePlanet(true)
    this.toUpdate.dead = Boolean(this.dead)

    this.crewMembers.forEach((cm) => {
      cm.targetLocation = false
      cm.location = `bunk`
    })

    if (!silent && this instanceof HumanShip) {
      this.logEntry(
        `Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`,
        `critical`,
      )
    }

    await db.ship.addOrUpdateInDb(this)
  }

  takeDamage(
    attacker: { name: string; [key: string]: any },
    attack: AttackDamageResult,
  ): TakenDamageResult {
    const res = super.takeDamage(attacker, attack)
    this.determineTargetShip()
    return res
  }

  determineTargetShip(): CombatShip | null {
    const setTarget = (t: CombatShip | null) => {
      // c.log(
      //   `updating ${this.name} target ship to ${
      //     t?.name || null
      //   }`,
      //   this.targetItemType,
      //   this.combatTactic,
      // )
      // c.trace()
      const previousTarget = this.targetShip
      this.targetShip = t

      if (
        // new target ship, make sure someone doesn't accidentally fire at it when they enter the weapons bay
        this.targetShip &&
        this.targetShip !== previousTarget
      ) {
        c.log(
          `gray`,
          `switched targets, resetting out-of-weapons members' tactics`,
        )
        this.crewMembers.forEach((cm) => {
          if (cm.location !== `weapons`) {
            // don't attack immediately on returning to weapons bay
            cm.combatTactic = `none`
            cm.toUpdate.combatTactic = cm.combatTactic
          }
        })
      }
      this.toUpdate.targetShip = t?.toReference() || null
      return t
    }

    if (this.membersIn(`weapons`).length === 0)
      return setTarget(null)

    // ----- pacifist strategy -----

    if (this.combatTactic === `pacifist`) {
      return setTarget(null)
    }

    let closestShip: CombatShip
    // ----- gather most common attack target -----
    const shipTargetCounts = this.membersIn(
      `weapons`,
    ).reduce(
      (
        totals: { target: CombatShip; total: number }[],
        cm,
      ) => {
        if (cm.attackTargetId === `any`) return totals
        let targetId = cm.attackTargetId
        if (cm.attackTargetId === `closest`) {
          if (!closestShip)
            closestShip = this.getEnemiesInAttackRange()[0]
          if (closestShip) targetId = closestShip.id
          else return totals
        }
        const currTotal = totals.find(
          (t) => t.target.id === targetId,
        )
        const skillWeight =
          cm.skills.find((s) => s.skill === `munitions`)
            ?.level || 1
        if (currTotal) currTotal.total += skillWeight
        else {
          const foundShip = this.game?.ships.find(
            (s) => s.id === targetId,
          ) as CombatShip
          if (foundShip)
            totals.push({
              target: foundShip,
              total: skillWeight,
            })
        }
        return totals
      },
      [],
    )

    this.idealTargetShip =
      (shipTargetCounts.sort(
        (b: any, a: any) => b.total - a.total,
      )?.[0]?.target as CombatShip | undefined) || null

    const shipTargetCountsWeightedByAttackable =
      shipTargetCounts.map((totalEntry) => {
        if (!this.canAttack(totalEntry.target))
          totalEntry.total -= 1000 // disincentive for ships out of range, etc, but still possible to end up with them if they're the only ones targeted
        return totalEntry
      })

    const mostViableManuallyTargetedShip =
      shipTargetCountsWeightedByAttackable.sort(
        (b: any, a: any) => b.total - a.total,
      )?.[0]?.target as CombatShip | undefined

    // ----- defensive strategy -----
    if (this.combatTactic === `defensive`) {
      if (
        mostViableManuallyTargetedShip &&
        this.canAttack(mostViableManuallyTargetedShip)
      ) {
        const attackedByThatTarget =
          this.visible.attackRemnants.find(
            (ar) =>
              ar.attacker.id ===
              mostViableManuallyTargetedShip.id,
          )
        if (attackedByThatTarget) {
          return setTarget(mostViableManuallyTargetedShip)
        }
      } else {
        const mostRecentDefense =
          this.visible.attackRemnants.reduce(
            (
              mostRecent:
                | AttackRemnant
                | AttackRemnantStub
                | null,
              ar,
            ): AttackRemnant | AttackRemnantStub | null => {
              // was defense
              if (
                ar.attacker.id === this.id ||
                ar.defender.id !== this.id
              )
                return mostRecent

              // attacker still exists
              const foundAttacker = this.game?.ships.find(
                (s) => s.id === ar.attacker.id,
              )
              if (!foundAttacker) return mostRecent

              // was most recent and can still attack
              return ar.time > (mostRecent?.time || 0) &&
                this.canAttack(foundAttacker, true)
                ? ({
                    ...ar,
                    attacker: foundAttacker,
                  } as any)
                : mostRecent
            },
            null,
          )
        return setTarget(
          (mostRecentDefense?.attacker as CombatShip) ||
            null,
        )
      }
    }

    // ----- aggressive strategy -----
    else if (
      [
        `aggressive`,
        `onlyNonPlayers`,
        `onlyPlayers`,
      ].includes(this.combatTactic)
    ) {
      let targetShip = mostViableManuallyTargetedShip
      // if the most manually targeted ship is viable, go for it
      if (
        this.combatTactic === `aggressive` ||
        (this.combatTactic === `onlyNonPlayers` &&
          targetShip?.ai) ||
        (this.combatTactic === `onlyPlayers` &&
          targetShip?.human)
      )
        if (targetShip && this.canAttack(targetShip, true))
          return setTarget(targetShip)

      // ----- if no attack target, pick the one we were most recently in combat with that's still in range -----
      const mostRecentCombat =
        this.visible.attackRemnants.reduce(
          (
            mostRecent:
              | AttackRemnant
              | AttackRemnantStub
              | null,
            ar,
          ): AttackRemnant | AttackRemnantStub | null => {
            const targetId =
              ar.attacker.id === this.id
                ? ar.defender
                : ar.attacker
            const foundShip = this.game?.ships.find(
              (s) => s.id === targetId.id,
            )
            if (
              !foundShip ||
              (this.combatTactic === `onlyNonPlayers` &&
                !targetShip?.ai) ||
              (this.combatTactic === `onlyPlayers` &&
                !targetShip?.human)
            )
              return mostRecent
            return ar.time > (mostRecent?.time || 0) &&
              this.canAttack(foundShip, true)
              ? ar
              : mostRecent
          },
          null,
        )

      if (mostRecentCombat) {
        const foundAttacker = this.game?.ships.find(
          (s) =>
            s.id ===
            (mostRecentCombat.attacker.id === this.id
              ? mostRecentCombat.defender.id
              : mostRecentCombat.attacker.id),
        ) as CombatShip
        if (foundAttacker) {
          targetShip = foundAttacker
        } else targetShip = undefined
      } else targetShip = undefined

      // ----- if there is no enemy from recent combat that we can hit, just pick the closest enemy -----
      if (!targetShip) {
        targetShip = this.getEnemiesInAttackRange()
          .filter(
            (s) =>
              this.combatTactic === `aggressive` ||
              (this.combatTactic === `onlyNonPlayers` &&
                s?.ai) ||
              (this.combatTactic === `onlyPlayers` &&
                s?.human),
          )
          .reduce(
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

      return setTarget(targetShip || null)
    }

    return setTarget(null)
  }

  recalculateCombatTactic() {
    const tacticCounts = this.membersIn(`weapons`).reduce(
      (totals: any, cm) => {
        if (!cm.combatTactic || cm.combatTactic === `none`)
          return totals
        const currTotal = totals.find(
          (t: any) => t.tactic === cm.combatTactic,
        )
        const toAdd =
          cm.skills.find((s) => s.skill === `munitions`)
            ?.level || 1
        if (currTotal) currTotal.total += toAdd
        else
          totals.push({
            tactic: cm.combatTactic,
            total: toAdd,
          })
        return totals
      },
      [],
    )
    const mainTactic =
      (tacticCounts.sort(
        (b: any, a: any) => b.total - a.total,
      )?.[0]?.tactic as CombatTactic) || `pacifist`

    this.combatTactic = mainTactic
    this.toUpdate.combatTactic = mainTactic

    this.determineTargetShip()
  }

  recalculateTargetItemType() {
    const memberTargetItemTypeCounts = this.membersIn(
      `weapons`,
    ).reduce((totals: any, cm) => {
      if (cm.targetItemType === `any`) return totals
      const currTotal = totals.find(
        (t: any) => t.targetItemType === cm.targetItemType,
      )
      const toAdd =
        cm.skills.find((s) => s.skill === `munitions`)
          ?.level || 1
      if (currTotal) currTotal.total += toAdd
      else
        totals.push({
          target: cm.targetItemType,
          total: toAdd,
        })
      return totals
    }, [])
    let mainTargetItemType: ItemType | `any` =
      memberTargetItemTypeCounts.sort(
        (b: any, a: any) => b.total - a.total,
      )?.[0]?.target || `any`

    this.targetItemType = mainTargetItemType
    this.toUpdate.targetItemType = mainTargetItemType
  }

  // ----- auto attack -----
  autoAttack() {
    const weaponsRoomMembers = this.membersIn(`weapons`)
    if (!weaponsRoomMembers.length) return

    // ----- if there is a target, attack with EVERY AVAILABLE WEAPON -----
    // canAttack is handled in attack function
    if (this.targetShip)
      this.availableWeapons()
        .filter(
          (w) =>
            w.effectiveRange >=
            c.distance(
              this.targetShip!.location,
              this.location,
            ),
        )
        .forEach((w) => {
          this.attack(
            this.targetShip!,
            w,
            this.targetItemType,
          )
        })
  }

  die(attacker?: CombatShip) {
    super.die(attacker)

    setTimeout(() => {
      this.logEntry(
        `Your ship has been destroyed! All of your cargo and most of your credits have been jettisoned, and only shreds of your equipment are salvageable for scrap, but the crew managed to escape back to their homeworld. Respawn and get back out there!`,
        `critical`,
      )

      this.checkAchievements(`death`)
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
    const lostItemValue =
      this.items?.reduce(
        (total, item) => total + item.baseData.basePrice,
        0,
      ) || 0
    const refundAmount =
      Math.max(0, lostItemValue - 20000) * 0.2
    this.commonCredits = refundAmount

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
      this.game?.addCache({
        contents: cacheContents,
        location: this.location,
        message: `Remains of ${this.name}`,
      })
  }

  get guildRankings() {
    return this.game?.guildRankings || {}
  }

  get gameSettings() {
    return this.game?.settings || defaultGameSettings()
  }
}
