import c from '../../../../../../common/dist'

import type { CombatShip } from '../CombatShip'
import type { Game } from '../../../Game'
import type { CrewMember } from '../../CrewMember/CrewMember'
import type { AttackRemnant } from '../../AttackRemnant'
import type { Planet } from '../../Planet/Planet'
import type { Comet } from '../../Planet/Comet'
import type { Cache } from '../../Cache'
import type { Ship } from '../Ship'
import type { Zone } from '../../Zone'
import type { Item } from '../Item/Item'
import type { HumanShip } from './HumanShip'

export function determineTargetShip(
  this: HumanShip,
): CombatShip | null {
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
      // c.log(
      //   `gray`,
      //   `switched targets, resetting out-of-weapons members' tactics`,
      // )
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
  const shipTargetCounts = this.membersIn(`weapons`).reduce(
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
      const existingTotal = totals.find(
        (t) => t.target.id === targetId,
      )
      const skillWeight = cm.dexterity.level
      if (existingTotal) existingTotal.total += skillWeight
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
      (b: any, a: any) => a.total - b.total,
    )?.[0]?.target as CombatShip | undefined) || null

  const shipTargetCountsWeightedByAttackable =
    shipTargetCounts.map((totalEntry) => {
      if (!this.canAttack(totalEntry.target))
        totalEntry.total -= 1000 // disincentive for ships out of range, etc, but still possible to end up with them if they're the only ones targeted
      return totalEntry
    })

  const mostViableManuallyTargetedShip =
    shipTargetCountsWeightedByAttackable.sort(
      (b: any, a: any) => a.total - b.total,
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
            ar.attacker?.id ===
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
              ar.attacker?.id === this.id ||
              ar.defender?.id !== this.id
            )
              return mostRecent

            // attacker still exists
            const foundAttacker = this.game?.ships.find(
              (s) => s.id === ar.attacker?.id,
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
        (mostRecentDefense?.attacker as CombatShip) || null,
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
            ar.attacker?.id === this.id
              ? ar.defender
              : ar.attacker
          const foundShip = this.game?.ships.find(
            (s) => s.id === targetId?.id,
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
          (mostRecentCombat.attacker?.id === this.id
            ? mostRecentCombat.defender?.id
            : mostRecentCombat.attacker?.id),
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
                c.distance(this.location, closest.location)
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

export function recalculateCombatTactic(this: HumanShip) {
  const tacticCounts = this.membersIn(`weapons`).reduce(
    (totals: any, cm) => {
      if (!cm.combatTactic || cm.combatTactic === `none`)
        return totals
      const existingTotal = totals.find(
        (t: any) => t.tactic === cm.combatTactic,
      )
      const toAdd = cm.dexterity.level
      if (existingTotal) existingTotal.total += toAdd
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
      (b: any, a: any) => a.total - b.total,
    )?.[0]?.tactic as CombatTactic) || `pacifist`

  this.combatTactic = mainTactic
  this.toUpdate.combatTactic = mainTactic

  this.determineTargetShip()
}

export function recalculateTargetItemType(this: HumanShip) {
  const memberTargetItemTypeCounts = this.membersIn(
    `weapons`,
  ).reduce((totals: any, cm) => {
    if (cm.targetItemType === `any`) return totals
    const existingTotal = totals.find(
      (t: any) => t.target === cm.targetItemType,
    )
    const toAdd = cm.dexterity.level
    if (existingTotal) existingTotal.total += toAdd
    else
      totals.push({
        target: cm.targetItemType,
        total: toAdd,
      })
    return totals
  }, [])
  let mainTargetItemType: ItemType | `any` =
    memberTargetItemTypeCounts.sort(
      (b: any, a: any) => a.total - b.total,
    )?.[0]?.target || `any`

  this.targetItemType = mainTargetItemType
  this.toUpdate.targetItemType = mainTargetItemType
}

// ----- auto attack -----
export function autoAttack(
  this: HumanShip,
  predeterminedHitChance?: number,
) {
  const weaponsRoomMembers = this.membersIn(`weapons`)
  if (!weaponsRoomMembers.length) return

  // ----- if there is a target, attack with EVERY AVAILABLE WEAPON -----
  // canAttack is handled in attack function
  const res: TakenDamageResult[] = []
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
        res.push(
          this.attack(
            this.targetShip!,
            w,
            this.targetItemType,
            predeterminedHitChance,
          ),
        )
      })
  return res
}
