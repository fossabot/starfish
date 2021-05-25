import c from '../../../../../common/dist'
import { db } from '../../../db'
import io from '../../../server/io'

import { membersIn, cumulativeSkillIn } from './addins/crew'

import { CombatShip } from './CombatShip'
import type { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import type { AttackRemnant } from '../AttackRemnant'
import type { Planet } from '../Planet'

export class HumanShip extends CombatShip {
  static maxLogLength = 20
  readonly id: string
  readonly log: LogEntry[]
  readonly crewMembers: CrewMember[] = []
  captain: string | null = null
  availableRooms: CrewLocation[] = [
    `bunk`,
    `cockpit`,
    `repair`,
    `weapons`,
  ]

  commonCredits: number = 0

  mainTactic: Tactic | undefined

  constructor(data: BaseHumanShipData, game: Game) {
    super(data, game)
    this.id = data.id
    //* id matches discord guildId here

    this.ai = false
    this.human = true

    this.captain = data.captain || null
    this.log = data.log || []

    if (data.commonCredits)
      this.commonCredits = data.commonCredits

    this.radii.scan = 0.25
    this.radii.broadcast = 0.6

    data.crewMembers?.forEach((cm) => {
      this.addCrewMember(cm)
    })

    if (!this.log.length)
      this.logEntry(
        `Your crew boards the ship ${this.name} for the first time, and sets out towards the stars.`,
        `medium`,
      )
  }

  tick() {
    super.tick()
    if (this.dead) return

    // ----- move -----
    this.move()

    this.visible = this.game.scanCircle(
      this.location,
      this.radii.sight,
      this.id,
      undefined,
      true,
    )

    this.crewMembers.forEach((cm) => cm.tick())
    this.toUpdate.crewMembers = this.crewMembers.map((cm) =>
      c.stubify<CrewMember, CrewMemberStub>(cm),
    )

    // ----- discover new planets -----
    const newPlanets = this.visible.planets.filter(
      (p) => !this.seenPlanets.includes(p),
    )
    if (newPlanets.length) {
      this.seenPlanets.push(...newPlanets)
      this.toUpdate.seenPlanets = c.stubify<
        Planet[],
        PlanetStub[]
      >(this.seenPlanets)
      db.ship.addOrUpdateInDb(this)
      newPlanets.forEach((p) =>
        this.logEntry(
          `You've discovered the planet ${p.name}!`,
          `high`,
        ),
      )
    }

    // ----- get nearby caches -----
    this.visible.caches.forEach((cache) => {
      if (this.isAt(cache.location)) {
        if (!cache.canBePickedUpBy(this)) return

        this.distributeCargoAmongCrew(cache.contents)
        this.logEntry(
          `Picked up a cache with ${cache.contents
            .map(
              (cc) =>
                `${Math.round(cc.amount * 10000) / 10000}${
                  cc.type === `credits` ? `` : ` tons of`
                } ${cc.type}`,
            )
            .join(` and `)} inside!${
            cache.message &&
            ` There was a message attached which said, "${cache.message}".`
          }`,
          `medium`,
        )
        this.game.removeCache(cache)
      }
    })

    // ----- auto-attacks -----
    this.autoAttack()

    // todo if no io watchers, skip this
    // ----- updates for frontend -----
    this.toUpdate.visible = c.stubify<any, VisibleStub>(
      this.visible,
      [`visible`, `seenPlanets`],
    )
    this.toUpdate.items = this.items.map((i) =>
      c.stubify(i),
    )
    // ----- send update to listeners -----
    if (!Object.keys(this.toUpdate).length) return
    io.to(`ship:${this.id}`).emit(`ship:update`, {
      id: this.id,
      updates: this.toUpdate,
    })
    this.toUpdate = {}
  }

  // ----- log -----

  logEntry(text: string, level: LogLevel = `low`) {
    this.log.push({ level, text, time: Date.now() })
    while (this.log.length > HumanShip.maxLogLength)
      this.log.shift()

    this.toUpdate.log = this.log

    if (level === `critical`)
      io.emit(`ship:message`, this.id, text)
  }

  // ----- move -----
  move(toLocation?: CoordinatePair) {
    super.move(toLocation)
    if (toLocation) {
      // ----- update planet -----
      const previousPlanet = this.planet
      this.planet =
        this.game.planets.find((p) =>
          this.isAt(p.location),
        ) || false
      if (previousPlanet !== this.planet)
        this.toUpdate.planet = this.planet
          ? c.stubify<Planet, PlanetStub>(this.planet)
          : false
      return
    }

    const startingLocation: CoordinatePair = [
      ...this.location,
    ]

    const membersInCockpit = this.membersIn(`cockpit`)
    if (!this.canMove || !membersInCockpit.length) {
      this.speed = 0
      this.velocity = [0, 0]
      this.toUpdate.speed = this.speed
      this.toUpdate.velocity = this.velocity
      return
    }

    const engineThrustMultiplier = this.engines
      .filter((e) => e.repair > 0)
      .reduce(
        (total, e) =>
          total + e.thrustAmplification * e.repair,
        0,
      )

    // ----- calculate new location based on target of each member in cockpit -----
    for (let member of membersInCockpit) {
      if (!member.targetLocation) continue

      const distanceToTarget = c.distance(
        this.location,
        member.targetLocation,
      )
      if (distanceToTarget < 0.000001) continue

      const skill =
        member.skills.find((s) => s.skill === `piloting`)
          ?.level || 1
      const thrustMagnitude = Math.min(
        c.getThrustMagnitudeForSingleCrewMember(
          skill,
          engineThrustMultiplier,
        ),
        distanceToTarget,
      )

      this.engines.forEach((e) => e.use())

      const unitVectorToTarget = c.degreesToUnitVector(
        c.angleFromAToB(
          this.location,
          member.targetLocation,
        ),
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

    this.updatePlanet()

    // ----- add previousLocation -----
    this.addPreviousLocation(startingLocation)

    // ----- random encounters -----
    const distanceTraveled = c.distance(
      this.location,
      startingLocation,
    )
    if (
      Math.random() * distanceTraveled >
      (1 - 0.00001 * c.gameSpeedMultiplier) *
        distanceTraveled
    ) {
      const amount =
        Math.round(
          Math.random() * 3 * (Math.random() * 3),
        ) /
          10 +
        1
      this.distributeCargoAmongCrew([
        { type: `salt`, amount },
      ])
      this.logEntry(
        `Encountered some space junk and managed to harvest ${amount} ton${
          amount === 1 ? `` : `s`
        } of salt off of it.`,
      )
    }
  }

  updatePlanet() {
    const previousPlanet = this.planet
    this.planet =
      this.visible.planets.find((p) =>
        this.isAt(p.location),
      ) || false
    if (previousPlanet !== this.planet)
      this.toUpdate.planet = this.planet
        ? c.stubify<Planet, PlanetStub>(this.planet)
        : false

    // -----  log for you and other ships on that planet when you land/depart -----
    if (this.planet && this.planet !== previousPlanet) {
      this.logEntry(
        `Landed on ${this.planet ? this.planet.name : ``}.`,
        `high`,
      )
      this.planet.shipsAt().forEach((s) => {
        if (s === this) return
        s.logEntry(
          `${this.name} landed on ${
            this.planet ? this.planet.name : ``
          }.`,
        )
      })
    } else if (previousPlanet && !this.planet) {
      this.logEntry(
        `Departed from ${
          previousPlanet ? previousPlanet.name : ``
        }.`,
      )
      if (previousPlanet)
        previousPlanet.shipsAt().forEach((s) => {
          if (s === this) return
          s.logEntry(
            `${this.name} departed from ${
              previousPlanet ? previousPlanet.name : ``
            }.`,
          )
        })
    }
  }

  applyTickOfGravity() {
    super.applyTickOfGravity()
    this.updatePlanet()
  }

  addCommonCredits(amount: number, member: CrewMember) {
    this.commonCredits += amount
    this.toUpdate.commonCredits = this.commonCredits
    member.addStat(`totalContributedToCommonFund`, amount)
  }

  broadcast(message: string) {
    const sanitized = c.sanitize(
      message.replace(/\n/g, ` `),
    ).result
    // todo get equipment, use it, and adjust output/range based on repair etc
    const range = this.radii.sight // for now
    let didSendCount = 0
    for (let otherShip of this.visible.ships.filter(
      (s) => s.human,
    )) {
      const distance = c.distance(
        this.location,
        otherShip.location,
      )
      if (distance > range) continue
      didSendCount++
      const antiGarble = 0.4
      const garbleAmount = distance / (range + antiGarble)
      const garbled = c.garble(sanitized, garbleAmount)
      const toSend = `**🚀${this.name}** says: *(${c.r2(
        distance,
        2,
      )}AU away, ${c.r2(
        Math.min(100, (1 - garbleAmount) * 100),
        0,
      )}% fidelity)*\n\`${garbled.substring(
        0,
        c.maxBroadcastLength,
      )}\``
      io.emit(
        `ship:message`,
        otherShip.id,
        toSend,
        `broadcast`,
      )
    }
    return didSendCount
  }

  // ----- room mgmt -----

  addRoom(room: CrewLocation) {
    if (!this.availableRooms.includes(room))
      this.availableRooms.push(room)
  }

  removeRoom(room: CrewLocation) {
    const index = this.availableRooms.findIndex(
      (r) => r === room,
    )
    if (index !== -1) this.availableRooms.splice(index, 1)
  }

  // ----- crew mgmt -----

  addCrewMember(data: BaseCrewMemberData): CrewMember {
    const cm = new CrewMember(data, this)
    this.crewMembers.push(cm)
    if (!this.captain) this.captain = cm.id
    c.log(
      `gray`,
      `Added crew member ${cm.name} to ${this.name}`,
    )
    db.ship.addOrUpdateInDb(this)
    return cm
  }

  removeCrewMember(id: string) {
    const index = this.crewMembers.findIndex(
      (cm) => cm.id === id,
    )

    if (index === -1) {
      c.log(
        `red`,
        `Attempted to remove crew member that did not exist ${id} from ship ${this.id}`,
      )
      return
    }

    this.crewMembers.splice(index, 1)
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
            if (contents.type === `credits`)
              cm.credits += amountForEach
            else {
              const leftOver = cm.addCargo(
                contents.type,
                amountForEach,
              )
              if (leftOver) {
                canHoldMore.splice(index, 1)
                return total + leftOver
              }
            }
            return total
          },
          0,
        )
      }
      if (toDistribute > 1) {
        const existing = leftovers.find(
          (l) => l.type === contents.type,
        )
        if (existing) existing.amount += toDistribute
        else
          leftovers.push({
            type: contents.type,
            amount: toDistribute,
          })
      }
    })
    if (leftovers.length) {
      setTimeout(
        () =>
          this.logEntry(
            `Your crew couldn't hold everything, so some cargo was released as a cache.`,
          ),
        500,
      )
      this.game.addCache({
        location: [...this.location],
        contents: leftovers,
        droppedBy: this.id,
      })
    }
  }

  // ----- respawn -----

  respawn() {
    super.respawn()

    if (this instanceof HumanShip) {
      this.logEntry(
        `Your crew, having barely managed to escape with their lives, scrounge together every credit they have to buy another basic ship.`,
        `critical`,
      )
    }
  }

  // ----- auto attack -----
  autoAttack() {
    this.toUpdate.targetShip = false

    const weaponsRoomMembers = this.membersIn(`weapons`)
    if (weaponsRoomMembers.length) {
      const tacticCounts = weaponsRoomMembers.reduce(
        (totals: any, cm) => {
          const currTotal = totals.find(
            (t: any) => t.tactic === cm.tactic,
          )
          if (currTotal) currTotal.total++
          else totals.push({ tactic: cm.tactic, total: 1 })
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
      this.toUpdate.enemiesInAttackRange = c.stubify(
        attackableShips,
        [`visible`, `seenPlanets`],
      )

      if (!mainTactic) return
      if (!attackableShips.length) return

      const availableWeapons = this.availableWeapons()
      if (!availableWeapons) return

      // ----- gather most common attack target -----

      const targetCounts = weaponsRoomMembers.reduce(
        (totals: any, cm) => {
          if (!cm.attackTarget) return totals
          const currTotal = totals.find(
            (t: any) => t.attackTarget === cm.attackTarget,
          )
          if (currTotal) currTotal.total++
          else
            totals.push({
              target: cm.attackTarget,
              total: 1,
            })
          return totals
        },
        [],
      )
      const mainAttackTarget = targetCounts.sort(
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
            this.visible.attackRemnants.reduce(
              (
                mostRecent: AttackRemnant | null,
                ar,
              ): AttackRemnant | null =>
                mostRecent &&
                mostRecent.time > ar.time &&
                mostRecent.attacker !== this &&
                this.canAttack(mostRecent.attacker)
                  ? mostRecent
                  : ar,
              null,
            )
          targetShip = mostRecentDefense?.attacker
        }
        this.toUpdate.targetShip = targetShip
          ? c.stubify<CombatShip, ShipStub>(targetShip, [
              `visible`,
              `seenPlanets`,
            ])
          : null
        if (!targetShip) return
        availableWeapons.forEach((w) => {
          this.attack(targetShip!, w)
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
                  mostRecent.attacker === this
                    ? mostRecent.defender
                    : mostRecent.attacker,
                )
                  ? mostRecent
                  : ar,
              null,
            )
          // ----- if all else fails, just attack whatever's around -----
          targetShip = mostRecentCombat
            ? mostRecentCombat.attacker === this
              ? mostRecentCombat.defender
              : mostRecentCombat.attacker
            : c.randomFromArray(attackableShips)
        }
        this.toUpdate.targetShip = c.stubify<
          CombatShip,
          ShipStub
        >(targetShip!, [`visible`, `seenPlanets`])
        // ----- with EVERY AVAILABLE WEAPON -----
        availableWeapons.forEach((w) => {
          this.attack(targetShip!, w)
        })
      }
    }
  }

  die() {
    super.die()

    setTimeout(() => {
      this.logEntry(
        `Your ship has been destroyed! All cargo and equipment are lost, along with most of your credits, but the crew managed to escape back to their homeworld. Respawn and get back out there!`,
        `critical`,
      )
    }, 100)

    const cacheContents: CacheContents[] = []

    this.crewMembers.forEach((cm) => {
      // ----- crew member cargo -----
      while (cm.inventory.length) {
        const toAdd = cm.inventory.pop()
        const existing = cacheContents.find(
          (cc) => cc.type === toAdd?.type,
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
        (cc) => cc.type === `credits`,
      )
      if (existing) existing.amount += toCache || 0
      else if (cm.credits)
        cacheContents.push({
          type: `credits`,
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
      (cc) => cc.type === `credits`,
    )
    if (existing) existing.amount += toCache || 0
    else if (this.commonCredits)
      cacheContents.push({
        type: `credits`,
        amount: toCache,
      })

    if (cacheContents.length)
      this.game.addCache({
        contents: cacheContents,
        location: this.location,
        message: `Remains of ${this.name}`,
      })
  }
}
