import c from '../../../../../common/dist'
import { Game } from '../../Game'
import { CrewMember } from '../CrewMember/CrewMember'
import { CombatShip } from './CombatShip'

import { membersIn, cumulativeSkillIn } from './addins/crew'
import { stubify } from '../../../server/io'
import { AttackRemnant } from '../AttackRemnant'

export class HumanShip extends CombatShip {
  readonly human: boolean
  readonly id: string
  crewMembers: CrewMember[] = []
  captain: string | null = null
  availableRooms: CrewLocation[] = [
    `bunk`,
    `cockpit`,
    `repair`,
    `weapons`,
  ]

  mainTactic: Tactic | undefined

  constructor(data: BaseHumanShipData, game: Game) {
    super(data, game)
    this.human = true
    this.id = data.id
    //* id matches discord guildId here
    this.captain = data.captain || null

    data.crewMembers?.forEach((cm) => {
      this.addCrewMember(cm)
    })
  }

  tick() {
    this.crewMembers.forEach((cm) => cm.tick())
    this.toUpdate.crewMembers = this.crewMembers.map((cm) =>
      stubify<CrewMember, CrewMemberStub>(cm),
    )
    super.tick()

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
      this.toUpdate.enemiesInAttackRange = stubify(
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
          ? stubify<CombatShip, ShipStub>(targetShip, [
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
        this.toUpdate.targetShip = stubify<
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

  addCrewMember(data: BaseCrewMemberData): CrewMember {
    const cm = new CrewMember(data, this)
    this.crewMembers.push(cm)
    if (!this.captain) this.captain = cm.id
    c.log(`Added crew member`, cm.name, `to`, this.name)
    return cm
  }

  removeCrewMember(id: string) {
    const index = this.crewMembers.findIndex(
      (cm) => cm.id === id,
    )

    if (index === -1) {
      c.log(
        `red`,
        `Attempted to remove crew member that did not exist`,
        id,
        `from ship`,
        this.id,
      )
      return
    }

    this.crewMembers.splice(index, 1)
  }

  membersIn = membersIn
  cumulativeSkillIn = cumulativeSkillIn

  respawn() {
    super.respawn()

    this.crewMembers.forEach((cm) => {
      while (cm.inventory.length) {
        const cachePayload = cm.inventory.pop()
        // todo spawn as caches
      }
      cm.location = `bunk`
      cm.credits *= 0.5
    })
  }
}
