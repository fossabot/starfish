import c from '../../../../../common/dist'

import * as roomActions from './addins/rooms'
import type { HumanShip } from '../Ship/HumanShip'
import { CrewActive } from './addins/CrewActive'
import { CrewPassive } from './addins/CrewPassive'
import type { CombatShip } from '../Ship/CombatShip'
import { Stubbable } from '../Stubbable'

export class CrewMember extends Stubbable {
  static readonly levelXPNumbers = c.levels
  static readonly baseMaxCargoSpace = 10

  readonly type = `crewMember`
  readonly id: string
  readonly ship: HumanShip
  name: string = `crew member`
  location: CrewLocation
  skills: XPData[]
  stamina: number
  maxStamina: number = 1
  lastActive: number
  targetLocation: CoordinatePair | null = null
  tactic: Tactic = `defensive`
  attackFactions: FactionKey[] = []
  attackTarget: CombatShip | null = null
  itemTarget: ItemType | null = null
  cockpitCharge: number = 0
  repairPriority: RepairPriority = `most damaged`
  minePriority: MinePriorityType = `closest`
  inventory: Cargo[]
  credits: number
  actives: CrewActive[] = []
  passives: CrewPassive[] = []
  upgrades: PassiveCrewUpgrade[] = []
  stats: CrewStatEntry[] = []
  maxCargoSpace: number = CrewMember.baseMaxCargoSpace

  tutorialShipId: string | undefined = undefined
  mainShipId: string | undefined = undefined

  toUpdate: { [key in keyof CrewMember]?: any } = {}

  constructor(data: BaseCrewMemberData, ship: HumanShip) {
    super()
    this.id = data.id
    this.ship = ship
    this.rename(data.name)

    const hasBunk = ship.rooms.bunk
    this.location =
      data.location ||
      ((hasBunk
        ? `bunk`
        : c.randomFromArray(
            Object.keys(ship.rooms),
          )) as CrewLocation) ||
      `bunk` // failsafe

    this.stamina = data.stamina || this.maxStamina
    this.lastActive = data.lastActive || Date.now()
    this.inventory = data.inventory?.filter((i) => i) || []
    this.cockpitCharge = data.cockpitCharge || 0
    this.credits = data.credits ?? 200
    this.skills = [
      ...(data.skills?.filter((s) => s) || []),
    ] || [
      { skill: `piloting`, level: 1, xp: 0 },
      { skill: `munitions`, level: 1, xp: 0 },
      { skill: `mechanics`, level: 1, xp: 0 },
      { skill: `linguistics`, level: 1, xp: 0 },
      { skill: `mining`, level: 1, xp: 0 },
    ]

    if (data.tutorialShipId)
      this.tutorialShipId = data.tutorialShipId
    if (data.mainShipId) this.mainShipId = data.mainShipId

    // if (data.actives)
    //   for (let a of data.actives)

    if (data.passives)
      for (let p of data.passives) this.addPassive(p)

    if (data.tactic) this.tactic = data.tactic
    if (data.itemTarget) this.itemTarget = data.itemTarget
    if (data.minePriority)
      this.minePriority = data.minePriority
    if (data.targetLocation)
      this.targetLocation = data.targetLocation
    if (data.attackFactions)
      this.attackFactions = data.attackFactions
    if (data.repairPriority)
      this.repairPriority = data.repairPriority
    if (data.stats) this.stats = [...data.stats]

    this.recalculateAll()

    this.toUpdate = this
  }

  rename(newName: string) {
    this.active()
    this.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0)
      this.name = `crew member`

    this.toUpdate.name = this.name
  }

  goTo(location: CrewLocation) {
    if (!(location in this.ship.rooms)) return false
    this.location = location
    this.toUpdate.location = this.location
    this.active()

    if (
      this.ship.crewMembers.length > 10 &&
      this.ship.crewMembers.reduce<boolean>(
        (all: boolean, cm: CrewMember): boolean => {
          return Boolean(all && cm.location === `bunk`)
        },
        true,
      )
    )
      this.ship.addTagline(
        `Nap Champions`,
        `having all 10+ crew members asleep at once`,
      )

    return true
  }

  cockpitAction = roomActions.cockpit
  repairAction = roomActions.repair
  weaponsAction = roomActions.weapons
  bunkAction = roomActions.bunk
  mineAction = roomActions.mine

  tick() {
    this._stub = null // invalidate stub

    // ----- reset attack target if out of vision range -----
    if (
      this.attackTarget &&
      !this.ship.visible.ships.find(
        (s) => s.id === this.attackTarget?.id,
      )
    ) {
      this.attackTarget = null
      this.toUpdate.attackTarget = this.attackTarget
    }

    // ----- actives -----
    this.actives.forEach((a) => a.tick())

    // ----- bunk -----
    if (this.location === `bunk`) {
      this.bunkAction()
      return
    }

    // ----- stamina check/use -----
    if (this.tired) return

    if (!this.ship.tutorial?.currentStep.disableStamina)
      this.stamina -=
        c.baseStaminaUse / (c.deltaTime / c.tickInterval)
    if (this.tired) {
      this.stamina = 0
      this.goTo(`bunk`)
      this.toUpdate.stamina = this.stamina
      return
    }
    this.toUpdate.stamina = this.stamina

    // ----- cockpit -----
    if (this.location === `cockpit`) this.cockpitAction()
    // ----- repair -----
    else if (this.location === `repair`) this.repairAction()
    // ----- weapons -----
    else if (this.location === `weapons`)
      this.weaponsAction()
    // ----- mine -----
    else if (this.location === `mine`) this.mineAction()
  }

  active() {
    this.lastActive = Date.now()
    this.toUpdate.lastActive = this.lastActive
  }

  addXp(skill: SkillId, xp?: number) {
    this.active()

    const xpBoostMultiplier =
      (this.ship.passives.find(
        (p) => p.id === `boostXpGain`,
      )?.intensity || 0) + 1
    if (!xp)
      xp =
        (c.baseXpGain / (c.deltaTime / c.tickInterval)) *
        xpBoostMultiplier

    let skillElement = this.skills.find(
      (s) => s?.skill === skill,
    )
    if (!skillElement) {
      const index = this.skills.push({
        skill,
        level: 1,
        xp,
      })
      skillElement = this.skills[index - 1]
    } else skillElement.xp += xp

    skillElement.level =
      CrewMember.levelXPNumbers.findIndex(
        (l) => (skillElement?.xp || 0) < l,
      )

    this.toUpdate.skills = this.skills
  }

  addCargo(id: CargoId, amount: number): number {
    amount = c.r2(amount, 2, true) // round down to 2 decimal places

    const canHold =
      Math.min(
        this.ship.chassis.maxCargoSpace,
        this.maxCargoSpace,
      ) - this.heldWeight
    const existingStock = this.inventory.find(
      (cargo) => cargo.id === id,
    )
    if (existingStock)
      existingStock.amount = c.r2(
        existingStock.amount + Math.min(canHold, amount),
      )
    else
      this.inventory.push({
        id,
        amount: Math.min(canHold, amount),
      })

    this.toUpdate.inventory = this.inventory

    this.ship.recalculateMass()

    return Math.max(0, amount - canHold)
  }

  removeCargo(id: CargoId, amount: number) {
    this.active()
    const existingStock = this.inventory.find(
      (cargo) => cargo.id === id,
    )
    if (existingStock)
      existingStock.amount = c.r2(
        existingStock.amount -
          Math.min(existingStock.amount, amount),
      )
    this.toUpdate.inventory = this.inventory
    this.ship.recalculateMass()
  }

  get heldWeight() {
    return this.inventory
      .filter((i) => i)
      .reduce((total, i) => total + i.amount, 0)
  }

  recalculateMaxCargoSpace() {
    const personalCargoSpacePassiveBoost =
      this.passives.find((p) => p.id === `cargoSpace`)
        ?.changeAmount || 0
    const shipwideCargoSpacePassiveBoost =
      this.ship.passives.find(
        (p) => p.id === `boostCargoSpace`,
      )?.intensity || 0
    this.maxCargoSpace =
      CrewMember.baseMaxCargoSpace +
      personalCargoSpacePassiveBoost +
      shipwideCargoSpacePassiveBoost

    this.toUpdate.maxCargoSpace = this.maxCargoSpace
  }

  addPassive(data: Partial<BaseCrewPassiveData>) {
    this.active()
    if (!data.id) return
    const existing = this.passives.find(
      (p) => p.id === data.id,
    )
    if (existing) {
      existing.level++
    } else {
      const fullPassiveData = {
        ...c.crewPassives[data.id],
        level: data.level || 1,
      }
      this.passives.push(
        new CrewPassive(fullPassiveData, this),
      )
    }

    this.toUpdate.passives = this.passives
    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  recalculateAll() {
    this.recalculateMaxCargoSpace()
  }

  addStat(statname: CrewStatKey, amount: number) {
    this.active()
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount += amount
    this.toUpdate.stats = this.stats
  }

  get tired() {
    return this.stamina <= 0
  }

  get piloting() {
    return (
      this.skills.find((s) => s?.skill === `piloting`) || {
        skill: `piloting`,
        level: 1,
        xp: 0,
      }
    )
  }

  get linguistics() {
    return (
      this.skills.find(
        (s) => s?.skill === `linguistics`,
      ) || { skill: `linguistics`, level: 1, xp: 0 }
    )
  }

  get munitions() {
    return (
      this.skills.find((s) => s?.skill === `munitions`) || {
        skill: `munitions`,
        level: 1,
        xp: 0,
      }
    )
  }

  get mechanics() {
    return (
      this.skills.find((s) => s?.skill === `mechanics`) || {
        skill: `mechanics`,
        level: 1,
        xp: 0,
      }
    )
  }

  get mining() {
    return (
      this.skills.find((s) => s?.skill === `mining`) || {
        skill: `mining`,
        level: 1,
        xp: 0,
      }
    )
  }
}
