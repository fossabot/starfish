import c from '../../../../../common/dist'

import * as roomActions from './addins/rooms'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
import { Stubbable } from '../Stubbable'

export class CrewMember extends Stubbable {
  static readonly levelXPNumbers = c.levels
  static readonly baseMaxCargoSpace = 10

  readonly type = `crewMember`
  readonly id: string
  readonly ship: HumanShip
  readonly joinDate: number
  name: string = `crew member`
  discordIcon?: string
  location: CrewLocation
  skills: XPData[]
  stamina: number
  speciesId?: SpeciesId
  maxStamina: number = 1
  lastActive: number
  targetLocation: CoordinatePair | false = false
  combatTactic: CombatTactic | `none` = `none`
  attackTargetId: string | `any` | `closest` = `any`
  targetItemType: ItemType | `any` = `any`
  cockpitCharge: number = 0
  repairPriority: RepairPriority = `most damaged`
  minePriority: MinePriorityType = `closest`
  inventory: Cargo[]
  maxCargoSpace: number = CrewMember.baseMaxCargoSpace
  credits: number
  crewCosmeticCurrency: number
  passives: CrewPassiveData[] = []
  permanentPassives: CrewPassiveData[] = []
  stats: CrewStatEntry[] = []
  bottomedOutOnStamina: boolean = false
  fullyRestedTarget: CrewLocation | false = false

  tutorialShipId: string | undefined = undefined
  mainShipId: string | undefined = undefined

  toUpdate: { [key in keyof CrewMember]?: any } = {}

  constructor(
    data: BaseCrewMemberData = {} as BaseCrewMemberData,
    ship: HumanShip,
  ) {
    super()
    this.id = data.id
    this.joinDate = data.joinDate || Date.now()
    this.discordIcon = data.discordIcon
    this.ship = ship
    this.rename(data.name)

    if (data.speciesId && c.species[data.speciesId])
      this.setSpecies(data.speciesId)

    const hasBunk = ship.rooms.bunk
    this.location =
      data.location ||
      ((hasBunk
        ? `bunk`
        : c.randomFromArray(
            Object.keys(ship.rooms),
          )) as CrewLocation) ||
      `bunk`

    this.lastActive = data.lastActive || Date.now()
    this.stamina = data.stamina || this.maxStamina
    this.cockpitCharge = data.cockpitCharge || 0

    this.inventory =
      data.inventory?.filter((i) => i && i.amount > 0) || []
    this.credits = data.credits ?? 0
    this.crewCosmeticCurrency =
      data.crewCosmeticCurrency ?? 0

    this.skills =
      data.skills && data.skills.length
        ? [...(data.skills.filter((s) => s) || [])]
        : [
            { skill: `piloting`, level: 1, xp: 0 },
            { skill: `munitions`, level: 1, xp: 0 },
            { skill: `mechanics`, level: 1, xp: 0 },
            { skill: `linguistics`, level: 1, xp: 0 },
            { skill: `mining`, level: 1, xp: 0 },
          ]

    if (data.tutorialShipId)
      this.tutorialShipId = data.tutorialShipId
    if (data.mainShipId) this.mainShipId = data.mainShipId

    if (data.permanentPassives) {
      for (let p of data.permanentPassives)
        this.addToPermanentPassive(p)
    }

    if (data.combatTactic)
      this.combatTactic = data.combatTactic
    if (data.targetItemType)
      this.targetItemType = data.targetItemType
    if (data.minePriority)
      this.minePriority = data.minePriority
    if (data.targetLocation)
      this.targetLocation = data.targetLocation
    if (data.repairPriority)
      this.repairPriority = data.repairPriority
    if (data.stats) this.stats = [...data.stats]

    this.recalculateAll()

    this.toUpdate = this
  }

  rename(newName: string) {
    this.name = c
      .sanitize(newName)
      .result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0)
      this.name = `crew member`

    this.toUpdate.name = this.name
  }

  goTo(
    location: CrewLocation,
    automated = false,
  ): undefined | string {
    const previousLocation = this.location
    if (!automated) this.active()

    if (!(location in this.ship.rooms))
      return `Invalid room.`

    // * if you hit 0, you must recharge to 5% to do anything
    this.location = this.bottomedOutOnStamina
      ? `bunk`
      : location
    this.toUpdate.location = this.location

    if (this.location !== previousLocation) {
      // if it's in a position to possibly immediately auto-attack something, don't
      if (
        this.location === `weapons` &&
        (
          [`aggressive`, `onlyPlayers`] as (
            | CombatTactic
            | `none`
          )[]
        ).includes(this.combatTactic) &&
        this.ship.membersIn(`weapons`).length <= 1 &&
        this.ship.availableWeapons().length >= 1 &&
        this.ship.getEnemiesInAttackRange().length > 0
      ) {
        this.combatTactic = `none`
        this.toUpdate.combatTactic = this.combatTactic
      }

      if (
        this.location === `weapons` ||
        previousLocation === `weapons`
      ) {
        // recalculate ship combat strategy on joining/leaving weapons bay
        this.ship.recalculateTargetItemType()
        this.ship.recalculateCombatTactic()
      }
    }

    this.ship.checkAchievements(`bunk`)

    if (this.bottomedOutOnStamina && location !== `bunk`)
      return `You've hit your limit! You must rest until you're at least ${c.r2(
        (this.ship.game?.settings
          .staminaBottomedOutResetPoint ||
          c.defaultGameSettings
            .staminaBottomedOutResetPoint) * 100,
      )}% recovered.`
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
      this.attackTargetId &&
      ![`closest`, `any`].includes(this.attackTargetId) &&
      !this.ship.visible.ships.find(
        (s) => s.id === this.attackTargetId,
      )
    ) {
      this.attackTargetId = `any`
      this.toUpdate.attackTargetId = this.attackTargetId
    }

    // ----- bunk -----
    if (this.location === `bunk`) {
      this.bunkAction()
      return
    }

    // ----- stamina check/use -----
    if (this.stamina <= 0) return

    if (!this.ship.tutorial?.currentStep?.disableStamina) {
      const reducedStaminaDrain =
        1 - this.getPassiveIntensity(`reduceStaminaDrain`)
      this.stamina -=
        (this.ship.game?.settings.baseStaminaUse ||
          c.defaultGameSettings.baseStaminaUse) *
        reducedStaminaDrain
    }
    if (this.stamina <= 0) {
      this.stamina = 0
      this.bottomedOutOnStamina = true
      this.toUpdate.bottomedOutOnStamina = true
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

  setSpecies(speciesId: SpeciesId) {
    // if somehow there already was one, remove its passives
    if (this.speciesId)
      for (let p of c.species[this.speciesId].passives)
        this.removePassive(p)

    if (c.species[speciesId]) {
      this.speciesId = speciesId
      this.toUpdate.speciesId = speciesId
      for (let p of c.species[speciesId].passives)
        this.applyPassive(p)
    }
  }

  buy(price: Price): true | string {
    this.active()
    if (!c.canAfford(price, this.ship, this))
      return `Insufficient funds.`

    this.credits -= price.credits || 0
    this.crewCosmeticCurrency -=
      price.crewCosmeticCurrency || 0
    this.toUpdate.crewCosmeticCurrency =
      this.crewCosmeticCurrency
    this.toUpdate.credits = this.credits
    return true
  }

  addXp(skill: SkillId, xp?: number) {
    const xpBoostMultiplier =
      this.ship.getPassiveIntensity(`boostXpGain`) +
      this.getPassiveIntensity(`boostXpGain`) +
      1

    if (!xp)
      xp =
        (this.ship.game?.settings.baseXpGain ||
          c.defaultGameSettings.baseXpGain) *
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

  /**
   * returns the amount left over after filling the crew member's max carryable capacity
   */
  addCargo(id: CargoId, amount: number): number {
    const canHold =
      Math.min(
        this.ship.chassis.maxCargoSpace,
        this.maxCargoSpace,
      ) - this.heldWeight

    if (amount <= 0 || isNaN(amount)) return 0

    amount = c.r2(amount, 2) // round to 2 decimal places

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

    if (amount <= 0 || isNaN(amount)) return

    const existingStock = this.inventory.find(
      (cargo) => cargo.id === id,
    )
    if (existingStock) {
      existingStock.amount = c.r2(
        existingStock.amount -
          Math.min(existingStock.amount, amount),
      )
      if (existingStock.amount <= 0)
        this.inventory = this.inventory.filter(
          (cargo) => cargo.id !== id,
        )
    }
    this.toUpdate.inventory = this.inventory
    this.ship.recalculateMass()
  }

  get heldWeight() {
    return this.inventory
      .filter((i) => i)
      .reduce((total, i) => total + i.amount, 0)
  }

  recalculateMaxCargoSpace() {
    this.maxCargoSpace =
      CrewMember.baseMaxCargoSpace +
      this.getPassiveIntensity(`cargoSpace`) +
      this.ship.getPassiveIntensity(`boostCargoSpace`)
    this.toUpdate.maxCargoSpace = this.maxCargoSpace
  }

  // ----- passives -----
  getPassiveIntensity(id: CrewPassiveId): number {
    return this.passives
      .filter((p) => p.id === id)
      .reduce((total, p) => (p.intensity || 0) + total, 0)
  }

  addToPermanentPassive(
    passive: CrewPassiveData | PlanetVendorCrewPassivePrice,
  ) {
    const found = this.permanentPassives.find(
      (p) => p.id === passive.id,
    )
    if (found) {
      if (found.intensity)
        found.intensity += passive.intensity || 0
      else found.intensity = passive.intensity || 0
    } else this.permanentPassives.push(passive)
    this.applyPassive({
      ...passive,
      data: {
        ...((passive as CrewPassiveData).data || {}),
        source: `permanent`,
      },
    })
  }

  applyPassive(p: CrewPassiveData) {
    if (
      p.data?.source === `permanent` &&
      this.passives.find(
        (ep) =>
          ep.data?.source === `permanent` && ep.id === p.id,
      )
    ) {
      const existing = this.passives.find(
        (ep) =>
          ep.data?.source === `permanent` && ep.id === p.id,
      )
      if (existing?.intensity)
        existing.intensity += p.intensity || 0
    } else this.passives.push(p)
    this.toUpdate.passives = this.passives

    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  removePassive(p: CrewPassiveData) {
    const foundIndex = this.passives.findIndex(
      (p2) => p2.id === p.id,
    )
    this.passives.splice(foundIndex, 1)
    this.toUpdate.passives = this.passives

    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  recalculateAll() {
    this.recalculateMaxStamina()
    this.recalculateMaxCargoSpace()
  }

  recalculateMaxStamina() {
    this.maxStamina =
      1 + this.getPassiveIntensity(`boostMaxStamina`) / 100
  }

  addStat(statname: CrewStatKey, amount: number) {
    const existing = this.stats.find(
      (s) => s.stat === statname,
    )
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount = (existing.amount || 0) + amount
    this.toUpdate.stats = this.stats
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
