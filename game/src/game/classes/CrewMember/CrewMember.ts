import c from '../../../../../common/dist'
import io from '../../../server/io'

import * as roomActions from './addins/rooms'
import type { HumanShip } from '../Ship/HumanShip'
import { Active } from './Active'
import type { CombatShip } from '../Ship/CombatShip'

export class CrewMember {
  static readonly passiveStaminaLossPerSecond = 0.0001
  static readonly levelXPNumbers = c.levels

  readonly id: string
  readonly ship: HumanShip
  name: string
  location: CrewLocation
  readonly skills: XPData[]
  stamina: number
  lastActive: number
  targetLocation: CoordinatePair | null = null
  tactic: Tactic = `defensive`
  attackFactions: FactionKey[] = []
  attackTarget: CombatShip | null = null
  repairPriority: RepairPriority = `most damaged`
  readonly inventory: Cargo[]
  credits: number
  readonly actives: Active[] = []
  readonly upgrades: PassiveCrewUpgrade[] = []
  maxCargoWeight: number = 10
  readonly stats: CrewStatEntry[] = []

  constructor(data: BaseCrewMemberData, ship: HumanShip) {
    this.id = data.id
    this.ship = ship
    this.name = data.name
    this.location = data.location || `bunk`
    this.stamina = data.stamina || this.maxStamina
    this.lastActive = Date.now()
    this.inventory = data.inventory || []
    this.credits = data.credits || 10
    this.skills = data.skills || [
      { skill: `piloting`, level: 1, xp: 0 },
      { skill: `munitions`, level: 1, xp: 0 },
      { skill: `mechanics`, level: 1, xp: 0 },
      { skill: `linguistics`, level: 1, xp: 0 },
    ]

    if (data.actives)
      for (let a of data.actives)
        this.actives.push(new Active(a, this))

    if (data.tactic) this.tactic = data.tactic
    if (data.targetLocation)
      this.targetLocation = data.targetLocation
    if (data.attackFactions)
      this.attackFactions = data.attackFactions
    if (data.repairPriority)
      this.repairPriority = data.repairPriority
    if (data.stats) this.stats = data.stats
  }

  rename(newName: string) {
    this.name = newName
  }

  goTo(location: CrewLocation) {
    this.location = location
    this.lastActive = Date.now()
  }

  cockpitAction = roomActions.cockpit
  repairAction = roomActions.repair
  weaponsAction = roomActions.weapons
  bunkAction = roomActions.bunk

  tick() {
    // ----- test notify listeners -----
    // todo
    io.to(`ship:${this.ship.id}`).emit(
      `crew:tired`,
      c.stubify<CrewMember, CrewMemberStub>(this),
    )

    // ----- reset attack target if out of vision range -----
    if (
      this.attackTarget &&
      !this.ship.visible.ships.includes(this.attackTarget)
    )
      this.attackTarget = null

    // ----- actives -----
    this.actives.forEach((a) => a.tick())

    // ----- bunk -----
    if (this.location === `bunk`) {
      this.bunkAction()
      return
    }

    // ----- stamina check/use -----
    if (this.tired) return

    this.stamina -=
      CrewMember.passiveStaminaLossPerSecond *
      c.gameSpeedMultiplier *
      (c.deltaTime / c.TICK_INTERVAL)
    if (this.tired) {
      this.stamina = 0
      this.goTo(`bunk`)

      // ----- notify listeners -----
      io.to(`ship:${this.ship.id}`).emit(
        `crew:tired`,
        c.stubify<CrewMember, CrewMemberStub>(this),
      )

      return
    }

    // ----- cockpit -----
    if (this.location === `cockpit`) this.cockpitAction()
    // ----- repair -----
    else if (this.location === `repair`) this.repairAction()
    // ----- weapons -----
    else if (this.location === `weapons`)
      this.weaponsAction()
  }

  addXp(skill: SkillName, xp?: number) {
    if (!xp)
      xp =
        (c.deltaTime / c.TICK_INTERVAL) *
        c.gameSpeedMultiplier
    let skillElement = this.skills.find(
      (s) => s.skill === skill,
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
        (l) => (skillElement?.xp || 0) <= l,
      )
  }

  addCargo(type: CargoType, amount: number) {
    const existingStock = this.inventory.find(
      (cargo) => cargo.type === type,
    )
    if (existingStock) existingStock.amount += amount
    else this.inventory.push({ type, amount })
  }

  get heldWeight() {
    return this.inventory.reduce(
      (total, i) => total + i.amount,
      0,
    )
  }

  addStat(statname: StatKey, amount: number) {
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount += amount
  }

  get tired() {
    return this.stamina <= 0
  }

  get maxStamina() {
    return 1
  }

  get piloting() {
    return this.skills.find((s) => s.skill === `piloting`)
  }

  get linguistics() {
    return this.skills.find(
      (s) => s.skill === `linguistics`,
    )
  }

  get munitions() {
    return this.skills.find((s) => s.skill === `munitions`)
  }

  get mechanics() {
    return this.skills.find((s) => s.skill === `mechanics`)
  }
}
