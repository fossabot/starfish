import c from '../../../../../common/dist'

import * as roomActions from './addins/rooms'
import { useActive, addActive, removeActive } from './addins/actives'
import type { HumanShip } from '../Ship/HumanShip/HumanShip'
import { Stubbable } from '../Stubbable'

import { addBackground, addTagline } from './addins/cosmetics'
import type { BasicPlanet } from '../Planet/BasicPlanet'

export class CrewMember extends Stubbable {
  static readonly baseMaxCargoSpace = 10

  readonly type = `crewMember`
  readonly id: string
  readonly ship: HumanShip
  readonly joinDate: number
  name: string = `crew member`
  discordIcon?: string
  location: CrewLocation
  skills: XPData[] = []
  level: number = 1
  /** amount, not percent. */
  stamina: number
  morale: number
  speciesId?: SpeciesId
  /** default 1 */
  maxStamina: number = 0.3
  lastActive: number
  targetLocation: CoordinatePair | false = false
  targetObject: { id: string; type: string; location: CoordinatePair } | false =
    false

  researchTargetId: string | null = null

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
  timedPassives: CrewPassiveData[] = []
  actives: CrewActive[] = []
  lastActiveUse: number = 0
  activeSlots: number = 0

  stats: CrewStatEntry[] = []
  bottomedOutOnStamina: boolean = false
  fullyRestedTarget: CrewLocation | false = false

  background: string | null
  availableBackgrounds: CrewBackground[] = []
  tagline: string | null
  availableTaglines: string[] = []

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

    this.tagline = data.tagline || null
    this.availableTaglines = data.availableTaglines || []
    this.background = data.background || null
    this.availableBackgrounds = data.availableBackgrounds || []

    if (data.speciesId && c.species[data.speciesId])
      this.setSpecies(data.speciesId)

    const hasBunk = ship.rooms.bunk
    this.location =
      data.location ||
      ((hasBunk
        ? `bunk`
        : c.randomFromArray(Object.keys(ship.rooms))) as CrewLocation) ||
      `bunk`

    this.lastActive = data.lastActive || Date.now()
    this.stamina = data.stamina || this.maxStamina
    this.morale = data.morale || 1
    this.cockpitCharge = data.cockpitCharge || 0

    this.inventory = data.inventory?.filter((i) => i && i.amount > 0) || []
    this.credits = data.credits ?? 0
    this.crewCosmeticCurrency = data.crewCosmeticCurrency ?? 0

    this.skills =
      data.skills && data.skills.length
        ? [...(data.skills.filter((s) => s) || [])]
        : [
            { skill: `strength`, level: 1, xp: 0 },
            { skill: `dexterity`, level: 1, xp: 0 },
            { skill: `intellect`, level: 1, xp: 0 },
            { skill: `charisma`, level: 1, xp: 0 },
            { skill: `endurance`, level: 1, xp: 0 },
          ]
    // todo temporary, remove
    if (!this.skills.find((s) => s.skill === `endurance`))
      this.skills.push({ skill: `endurance`, level: 1, xp: 0 })

    if (data.tutorialShipId) this.tutorialShipId = data.tutorialShipId
    if (data.mainShipId) this.mainShipId = data.mainShipId

    // if (data.actives) this.actives = data.actives
    this.lastActiveUse = data.lastActiveUse || 0
    // this.addActive({
    //   id: `instantStamina`,
    //   intensity: 0.3,
    // })
    // this.addActive({
    //   id: `combatDrone`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `repairDrone`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `cargoSweep`,
    //   intensity: 0.3,
    // })
    // this.addActive({
    //   id: `boostShipSightRange`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostWeaponChargeSpeed`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostCharisma`,
    //   intensity: 0.4,
    // })
    // this.addActive({
    //   id: `boostIntellect`,
    //   intensity: 0.3,
    // })
    // this.addActive({
    //   id: `boostDexterity`,
    //   intensity: 0.5,
    // })
    // this.addActive({
    //   id: `boostStrength`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostMorale`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostThrust`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostMineSpeed`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostRepairSpeed`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `generalImprovementWhenAlone`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `generalImprovementPerCrewMemberInSameRoom`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `fullCrewSkillBoost`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `flatDamageReduction`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostChassisAgility`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `seeTrailColors`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostDamageToEngines`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostDamageToScanners`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `boostDamageToWeapons`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `broadcastRangeCargoPrices`,
    //   intensity: 0.2,
    // })
    // this.addActive({
    //   id: `damageToAllNearbyEnemies`,
    //   intensity: 0.2,
    // })

    if (data.permanentPassives) {
      for (let p of data.permanentPassives) this.addToPermanentPassive(p)
    }
    if (data.timedPassives) {
      for (let p of data.timedPassives) this.applyPassive(p)
    }

    if (data.combatTactic) this.combatTactic = data.combatTactic
    if (data.targetItemType) this.targetItemType = data.targetItemType
    if (data.minePriority) this.minePriority = data.minePriority
    if (
      data.targetLocation &&
      data.targetLocation.length === 2 &&
      !data.targetLocation.find((t: any) => !Number(t))
    )
      this.targetLocation = data.targetLocation
    if (data.repairPriority) this.repairPriority = data.repairPriority
    if (data.stats) this.stats = [...data.stats]

    if (data.researchTargetId) this.researchTargetId = data.researchTargetId

    this.recalculateAll()

    this.toUpdate = this
  }

  addTagline = addTagline
  addBackground = addBackground

  rename(newName: string) {
    this.name = c.sanitize(newName).result.substring(0, c.maxNameLength)
    if (this.name.replace(/\s/g, ``).length === 0) this.name = `crew member`

    this.toUpdate.name = this.name
  }

  goTo(location: CrewLocation, automated = false): undefined | string {
    const previousLocation = this.location
    if (!automated) this.active()

    if (!(location in this.ship.rooms)) return `Invalid room.`

    // * if you hit 0, you must recharge to 5% to do anything
    this.location = this.bottomedOutOnStamina ? `bunk` : location
    this.toUpdate.location = this.location

    if (this.location !== previousLocation) {
      // if it's in a position to possibly immediately auto-attack something, don't
      if (
        this.location === `weapons` &&
        ([`aggressive`, `onlyPlayers`] as (CombatTactic | `none`)[]).includes(
          this.combatTactic,
        ) &&
        this.ship.membersIn(`weapons`).length <= 1 &&
        this.ship.availableWeapons().length >= 1 &&
        this.ship.getEnemiesInAttackRange().length > 0
      ) {
        this.combatTactic = `none`
        this.toUpdate.combatTactic = this.combatTactic
      }

      if (this.location === `weapons` || previousLocation === `weapons`) {
        // recalculate ship combat strategy on joining/leaving weapons bay
        this.ship.recalculateTargetItemType()
        this.ship.recalculateCombatTactic()
      }
    }

    this.ship.checkAchievements(`bunk`)

    if (this.bottomedOutOnStamina && location !== `bunk`)
      return `You've hit your limit! You must rest until you're at least ${c.r2(
        (this.ship.game?.settings.staminaBottomedOutResetPoint ||
          c.defaultGameSettings.staminaBottomedOutResetPoint) * 100,
      )}% recovered.`
  }

  cockpitAction = roomActions.cockpit
  repairAction = roomActions.repair
  weaponsAction = roomActions.weapons
  bunkAction = roomActions.bunk
  mineAction = roomActions.mine
  labAction = roomActions.lab

  tick() {
    this._stub = null // invalidate stub

    // ----- reset targetLocation if targetObject has moved/gone out of sight -----
    if (this.location === `cockpit` && this.targetObject) {
      const isSelf = this.targetObject?.id === this.ship.id
      const movingObject = isSelf
        ? this.ship
        : this.ship.visible.comets.find(
            (e) => e.id === (this.targetObject as any).id,
          ) ||
          this.ship.visible.ships.find(
            (e) => e.id === (this.targetObject as any).id,
          )
      // if more things start moving we might need to update this to include them

      if (!movingObject) {
        this.targetObject = false
        this.toUpdate.targetObject = false
      } else if (
        movingObject.location[0] !== this.targetLocation[0] ||
        movingObject.location[1] !== this.targetLocation[1]
      ) {
        this.targetLocation = [...movingObject.location] as CoordinatePair
        this.toUpdate.targetLocation = this.targetLocation
      }
    }

    // ----- reset attack target if out of vision range -----
    if (
      this.attackTargetId &&
      ![`closest`, `any`].includes(this.attackTargetId) &&
      !this.ship.visible.ships.find((s) => s.id === this.attackTargetId)
    ) {
      this.attackTargetId = `any`
      this.toUpdate.attackTargetId = this.attackTargetId
    }

    // ----- drip-feed morale changes -----
    // morale gain from basic planets
    if ((this.ship.planet as BasicPlanet)?.planetType === `basic`)
      this.changeMorale(
        0.000005 *
          ((this.ship.planet as BasicPlanet).level || 0) *
          (c.tickInterval / 1000),
      )
    // morale loss otherwise
    else {
      this.changeMorale(-1 * 0.000003 * (c.tickInterval / 1000))
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
          c.defaultGameSettings.baseStaminaUse) * reducedStaminaDrain
    }
    if (this.stamina <= 0) {
      this.stamina = 0
      this.changeMorale(-0.1)
      this.bottomedOutOnStamina = true
      this.toUpdate.bottomedOutOnStamina = true
      this.goTo(`bunk`)
      this.toUpdate.stamina = this.stamina
      return
    }
    this.toUpdate.stamina = this.stamina

    this.checkExpiredPassives()

    // ----- cockpit -----
    if (this.location === `cockpit`) this.cockpitAction()
    // ----- repair -----
    else if (this.location === `repair`) this.repairAction()
    // ----- weapons -----
    else if (this.location === `weapons`) this.weaponsAction()
    // ----- mine -----
    else if (this.location === `mine`) this.mineAction()
    // ----- lab -----
    else if (this.location === `lab`) this.labAction()

    // ----- add endurance xp -----
    this.addXp(
      `endurance`,
      (this.ship.game?.settings.enduranceXpGainPerSecond ||
        c.defaultGameSettings.enduranceXpGainPerSecond) *
        (c.tickInterval / 1000),
    )
  }

  active() {
    this.lastActive = Date.now()
    this.toUpdate.lastActive = this.lastActive
  }

  setSpecies(speciesId: SpeciesId) {
    // if somehow there already was one, remove its passives
    if (this.speciesId)
      for (let p of c.species[this.speciesId].passives) this.removePassive(p)

    if (c.species[speciesId]) {
      this.speciesId = speciesId
      this.toUpdate.speciesId = speciesId
      for (let p of c.species[speciesId].passives) this.applyPassive(p)
    }
  }

  buy(price: Price): true | string {
    this.active()
    if (!c.canAfford(price, this.ship, this)) return `Insufficient funds.`

    this.credits -= price.credits || 0
    this.crewCosmeticCurrency -= price.crewCosmeticCurrency || 0
    this.toUpdate.crewCosmeticCurrency = this.crewCosmeticCurrency
    this.toUpdate.credits = this.credits

    if (price.credits) this.changeMorale(price.credits * 0.001)
    if (price.crewCosmeticCurrency)
      this.changeMorale(price.crewCosmeticCurrency * 0.01)

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
          c.defaultGameSettings.baseXpGain) * xpBoostMultiplier

    let skillElement = this.skills.find((s) => s?.skill === skill)
    if (!skillElement) {
      const index = this.skills.push({
        skill,
        level: 1,
        xp,
      })
      skillElement = this.skills[index - 1]
    } else skillElement.xp += xp

    const prevLevel = skillElement.level

    skillElement.level = c.levels.findIndex((l) => (skillElement?.xp || 0) < l)

    // level up checks
    if (prevLevel !== skillElement.level) {
      this.updateLevel()

      if (skill === `endurance`) this.recalculateMaxStamina()
    }

    this.toUpdate.skills = this.skills
  }

  updateLevel() {
    this.level = Math.floor(
      this.skills.reduce((acc, skill) => acc + (skill.level || 1), 0) /
        this.skills.length || 1,
    )
    this.toUpdate.level = this.level
  }

  updateActives() {
    const activeCountToAdd = c.activeUnlockLevels.findIndex(
      (l) => this.level < l,
    )
    const passiveBoost = this.getPassiveIntensity(`boostActiveSlots`)
    this.activeSlots = activeCountToAdd + passiveBoost
    this.toUpdate.activeSlots = this.activeSlots

    for (let a of Object.values(c.crewActives).filter((ca) => ca.captain))
      if (this.id === this.ship.captain)
        this.addActive({ id: a.id, intensity: 1 })
      else this.removeActive(a.id)

    if (this.speciesId)
      for (let a of c.species[this.speciesId].activeTree.slice(
        0,
        this.activeSlots,
      ))
        this.addActive(a)
  }

  useActive = useActive
  addActive = addActive
  removeActive = removeActive

  /**
   * @param amount morale to add, or negative to subtract
   */
  changeMorale(amount: number) {
    if (Math.abs(amount) < 0.00000000001) return
    // negative things hurt less when u sleepin
    if (this.location === `bunk` && amount < 0) amount *= 0.5

    this.morale += amount
    if (this.morale > 1) this.morale = 1
    if (this.morale < 0) this.morale = 0

    if (
      this.morale <
      (this.ship.game?.settings.moraleLowThreshold ||
        c.defaultGameSettings.moraleLowThreshold)
    )
      this.setLowMorale()
    else if (
      this.morale >
      (this.ship.game?.settings.moraleHighThreshold ||
        c.defaultGameSettings.moraleHighThreshold)
    )
      this.setHighMorale()
    else this.clearMoralePassives()

    this.toUpdate.morale = this.morale
    // if (Math.abs(amount) > 1) {
    //   c.log(this.ship.name, this.name, amount, this.morale)
    // }
  }

  clearMoralePassives() {
    this.passives.forEach((p) => {
      if (
        typeof p.data?.source === `string` &&
        [`highMorale`, `lowMorale`].includes(p.data?.source)
      ) {
        this.removePassive(p)
      }
    })
  }

  setLowMorale() {
    const passives: CrewPassiveData[] = [
      { id: `boostMaxStamina`, intensity: -40 },
      {
        id: `boostThrust`,
        intensity: -0.2,
      },
      {
        id: `boostPassiveThrust`,
        intensity: -0.2,
      },
      {
        id: `generalImprovementWhenAlone`,
        intensity: 0.3,
      },
    ]
    if (
      this.passives.find(
        (p) => p.id === passives[0].id && p.intensity === passives[0].intensity,
      )
    )
      return

    for (let p of passives)
      this.applyPassive({
        id: p.id,
        intensity: p.intensity,
        data: { ...(p.data || {}), source: `lowMorale` },
      })

    if (this.stamina > this.maxStamina) this.stamina = this.maxStamina

    // todo lower damage
  }

  setHighMorale() {
    if (
      this.passives.find(
        (p) => p.id === `reduceStaminaDrain` && p.intensity === 0.1,
      )
    )
      return

    const passives: CrewPassiveData[] = [
      {
        id: `reduceStaminaDrain`,
        intensity: 0.1,
      },
      {
        id: `boostThrust`,
        intensity: 0.1,
      },
      {
        id: `boostXpGain`,
        intensity: 0.1,
      },
      {
        id: `generalImprovementPerCrewMemberInSameRoom`,
        intensity: 0.05,
      },
    ]
    if (
      this.passives.find(
        (p) => p.id === passives[0].id && p.intensity === passives[0].intensity,
      )
    )
      return

    for (let p of passives)
      this.applyPassive({
        id: p.id,
        intensity: p.intensity,
        data: { ...(p.data || {}), source: `highMorale` },
      })
  }

  /**
   * returns the amount left over after filling the crew member's max carryable capacity
   */
  addCargo(id: CargoId, amount: number): number {
    const canHold =
      Math.min(this.ship.chassis.maxCargoSpace, this.maxCargoSpace) -
      this.heldWeight

    if (amount <= 0 || isNaN(amount)) return 0

    amount = c.r2(amount, 2) // round to 2 decimal places

    const existingStock = this.inventory.find((cargo) => cargo.id === id)
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

    const existingStock = this.inventory.find((cargo) => cargo.id === id)
    if (existingStock) {
      existingStock.amount = c.r2(
        existingStock.amount - Math.min(existingStock.amount, amount),
      )
      if (existingStock.amount <= 0)
        this.inventory = this.inventory.filter((cargo) => cargo.id !== id)
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
    const found = this.permanentPassives.find((p) => p.id === passive.id)
    if (found) {
      if (found.intensity) found.intensity += passive.intensity || 0
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
        (ep) => ep.data?.source === `permanent` && ep.id === p.id,
      )
    ) {
      const existing = this.passives.find(
        (ep) => ep.data?.source === `permanent` && ep.id === p.id,
      )
      if (existing?.intensity) existing.intensity += p.intensity || 0
    } else this.passives.push(p)
    this.toUpdate.passives = this.passives

    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  applyTimedPassive(p: CrewPassiveData & { until: number }) {
    // this just saves it in the db; it has no effect until the game is restarted and timed passives are loaded
    this.timedPassives.push(p)

    this.passives.push(p)
    this.toUpdate.passives = this.passives
    this.recalculateAll()
  }

  removePassive(p: CrewPassiveData) {
    const foundIndex = this.passives.findIndex((p2) => {
      for (let key in p)
        if (typeof p[key] !== `object` && p2[key] !== p[key]) return false

      if (typeof p.data?.source === `string`)
        return p.data.source === p2.data?.source

      for (let prop of Object.keys(p.data?.source || {}))
        if (typeof p.data?.source?.[prop] === `string`)
          if (p2.data?.source?.[prop] !== p.data?.source?.[prop]) return false
          else if (typeof p.data?.source?.[prop] === `object`)
            for (let prop2 of Object.keys(p.data?.source[prop] || {}))
              if (
                p2.data?.source?.[prop]?.[prop2] !==
                p.data?.source?.[prop]?.[prop2]
              )
                return false

      return true
    })
    if (foundIndex === -1) return
    this.passives.splice(foundIndex, 1)
    this.toUpdate.passives = this.passives

    // reset all variables that might have changed because of this
    this.recalculateAll()
  }

  checkExpiredPassives() {
    this.passives.forEach((p) => {
      if (!p.until) return
      if (p.until < Date.now()) this.removePassive(p)
    })
  }

  recalculateAll() {
    this.changeMorale(0)
    this.updateLevel()
    this.recalculateMaxStamina()
    this.recalculateMaxCargoSpace()
    this.checkExpiredPassives()
    this.updateActives()
  }

  recalculateMaxStamina() {
    const prev = this.maxStamina
    const baseMax = c.getMaxStamina(this.endurance.level)
    this.maxStamina = Math.max(
      0.3,
      c.r2(baseMax + this.getPassiveIntensity(`boostMaxStamina`) / 100, 3),
    )
    if (this.maxStamina !== prev) this.toUpdate.maxStamina = this.maxStamina
  }

  recalculateResearchTargetId() {
    this.researchTargetId =
      this.ship.items
        .filter(
          (i) =>
            i.upgradable &&
            i.level < i.maxLevel &&
            (i.upgradeRequirements.find((req) => req.research)?.current || 0) <
              (i.upgradeRequirements.find((req) => req.research)?.required ||
                0),
        )
        .sort((a, b) => a.level - b.level)?.[0]?.id || null
    this.toUpdate.researchTargetId = this.researchTargetId
  }

  addStat(statname: CrewStatKey, amount: number) {
    const existing = this.stats.find((s) => s.stat === statname)
    if (!existing)
      this.stats.push({
        stat: statname,
        amount,
      })
    else existing.amount = (existing.amount || 0) + amount
    this.toUpdate.stats = this.stats
  }

  get strength() {
    const boost =
      this.getPassiveIntensity(`boostStrength`) +
      this.ship.getPassiveIntensity(`flatSkillBoost`)
    const val = this.skills.find((s) => s?.skill === `strength`) || {
      skill: `strength`,
      level: 1,
      xp: 0,
    }
    return { ...val, level: val.level + boost }
  }

  get dexterity() {
    const boost =
      this.getPassiveIntensity(`boostDexterity`) +
      this.ship.getPassiveIntensity(`flatSkillBoost`)
    const val = this.skills.find((s) => s?.skill === `dexterity`) || {
      skill: `dexterity`,
      level: 1,
      xp: 0,
    }
    return { ...val, level: val.level + boost }
  }

  get charisma() {
    const boost =
      this.getPassiveIntensity(`boostCharisma`) +
      this.ship.getPassiveIntensity(`flatSkillBoost`)
    const val = this.skills.find((s) => s?.skill === `charisma`) || {
      skill: `charisma`,
      level: 1,
      xp: 0,
    }
    return { ...val, level: val.level + boost }
  }

  get intellect() {
    const boost =
      this.getPassiveIntensity(`boostIntellect`) +
      this.ship.getPassiveIntensity(`flatSkillBoost`)
    const val = this.skills.find((s) => s?.skill === `intellect`) || {
      skill: `intellect`,
      level: 1,
      xp: 0,
    }
    return { ...val, level: val.level + boost }
  }

  get endurance() {
    const boost =
      this.getPassiveIntensity(`boostEndurance`) +
      this.ship.getPassiveIntensity(`flatSkillBoost`)
    const val = this.skills.find((s) => s?.skill === `endurance`) || {
      skill: `endurance`,
      level: 1,
      xp: 0,
    }
    return { ...val, level: val.level + boost }
  }
}
