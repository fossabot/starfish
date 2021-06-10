import c from '../../../../../common/dist'

import * as roomActions from './addins/rooms'
import * as passives from '../../presets/crewPassives'
import type { HumanShip } from '../Ship/HumanShip'
import { CrewActive } from './addins/CrewActive'
import { CrewPassive } from './addins/CrewPassive'
import type { CombatShip } from '../Ship/CombatShip'
import { Stubbable } from '../Stubbable'

export class CrewMember extends Stubbable {
  static readonly levelXPNumbers = c.levels
  static readonly baseMaxCargoWeight = 10

  readonly id: string
  readonly ship: HumanShip
  name: string = `crew member`
  location: CrewLocation
  readonly skills: XPData[]
  stamina: number
  lastActive: number
  targetLocation: CoordinatePair | null = null
  tactic: Tactic = `defensive`
  attackFactions: FactionKey[] = []
  attackTarget: CombatShip | null = null
  itemTarget: ItemType | null = null
  repairPriority: RepairPriority = `most damaged`
  readonly inventory: Cargo[]
  credits: number
  readonly actives: CrewActive[] = []
  readonly passives: CrewPassive[] = []
  readonly upgrades: PassiveCrewUpgrade[] = []
  readonly stats: CrewStatEntry[] = []
  maxCargoWeight: number = CrewMember.baseMaxCargoWeight

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
    this.lastActive = Date.now()
    this.inventory = data.inventory || []
    this.credits = data.credits || 10
    this.skills = data.skills || [
      { skill: `piloting`, level: 1, xp: 0 },
      { skill: `munitions`, level: 1, xp: 0 },
      { skill: `mechanics`, level: 1, xp: 0 },
      { skill: `linguistics`, level: 1, xp: 0 },
    ]

    // if (data.actives)
    //   for (let a of data.actives)

    if (data.passives)
      for (let p of data.passives) this.addPassive(p)

    if (data.tactic) this.tactic = data.tactic
    if (data.itemTarget) this.itemTarget = data.itemTarget
    if (data.targetLocation)
      this.targetLocation = data.targetLocation
    if (data.attackFactions)
      this.attackFactions = data.attackFactions
    if (data.repairPriority)
      this.repairPriority = data.repairPriority
    if (data.stats) this.stats = data.stats
  }

  rename(newName: string) {
    this.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0)
      this.name = `crew member`
  }

  goTo(location: CrewLocation) {
    if (!(location in this.ship.rooms)) return false
    this.location = location
    this.lastActive = Date.now()
    return true
  }

  cockpitAction = roomActions.cockpit
  repairAction = roomActions.repair
  weaponsAction = roomActions.weapons
  bunkAction = roomActions.bunk

  tick() {
    this._stub = null // invalidate stub

    // ----- reset attack target if out of vision range -----
    if (
      this.attackTarget &&
      !this.ship.visible.ships.find(
        (s) => s.id === this.attackTarget?.id,
      )
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

    if (!this.ship.tutorial?.currentStep.disableStamina)
      this.stamina -=
        c.baseStaminaUse / (c.deltaTime / c.TICK_INTERVAL)
    if (this.tired) {
      this.stamina = 0
      this.goTo(`bunk`)
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

  addXp(skill: SkillType, xp?: number) {
    if (!xp)
      xp = c.baseXpGain / (c.deltaTime / c.TICK_INTERVAL)
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

  addCargo(type: CargoType, amount: number): number {
    const canHold = this.maxCargoWeight - this.heldWeight
    const existingStock = this.inventory.find(
      (cargo) => cargo.type === type,
    )
    if (existingStock)
      existingStock.amount += Math.min(canHold, amount)
    else
      this.inventory.push({
        type,
        amount: Math.min(canHold, amount),
      })
    return Math.max(0, amount - canHold)
  }

  get heldWeight() {
    return this.inventory.reduce(
      (total, i) => total + i.amount,
      0,
    )
  }

  recalculateMaxCargoWeight() {
    const cargoSpacePassiveBoost =
      this.passives.find((p) => p.type === `cargoSpace`)
        ?.changeAmount || 0
    this.maxCargoWeight =
      CrewMember.baseMaxCargoWeight + cargoSpacePassiveBoost
  }

  addPassive(data: Partial<BaseCrewPassiveData>) {
    if (!data.type) return
    const existing = this.passives.find(
      (p) => p.type === data.type,
    )
    if (existing) {
      existing.level++
    } else {
      const fullPassiveData = {
        ...passives[data.type],
        level: data.level || 1,
      }
      this.passives.push(
        new CrewPassive(fullPassiveData, this),
      )
    }
    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  recalculateAll() {
    this.recalculateMaxCargoWeight()
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
