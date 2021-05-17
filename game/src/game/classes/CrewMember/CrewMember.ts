import c from '../../../../../common/dist'
import { io, stubify } from '../../../server/io'
import * as roomActions from './addins/rooms'
import { HumanShip } from '../Ship/HumanShip'

export class CrewMember {
  static readonly passiveStaminaLossPerSecond = 0.0001
  static readonly levelXPNumbers = c.levels

  readonly id: string
  readonly ship: HumanShip
  name: string
  location: CrewLocation
  skills: XPData[]
  stamina: number
  lastActive: number
  targetLocation: CoordinatePair | null = null
  inventory: Cargo[]
  credits: number

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
  }

  rename(newName: string) {
    this.name = newName
  }

  goTo(location: CrewLocation) {
    // if (this.location === `cockpit`)
    //   this.targetLocation = null
    this.location = location
    this.lastActive = Date.now()
  }

  cockpitAction = roomActions.cockpit
  repairAction = roomActions.repair
  weaponsAction = roomActions.weapons
  bunkAction = roomActions.bunk

  tick() {
    // ----- test notify listeners -----
    io.to(`ship:${this.ship.id}`).emit(
      `crew:tired`,
      stubify<CrewMember, CrewMemberStub>(this),
    )

    // ----- bunk -----
    if (this.location === `bunk`) {
      this.bunkAction()
      return
    }

    // ----- stamina check/use -----
    if (this.tired) return

    this.stamina -=
      CrewMember.passiveStaminaLossPerSecond *
      (c.deltaTime / 1000)
    if (this.tired) {
      this.stamina = 0
      this.goTo(`bunk`)

      // ----- notify listeners -----
      io.to(`ship:${this.ship.id}`).emit(
        `crew:tired`,
        stubify<CrewMember, CrewMemberStub>(this),
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
    if (!xp) xp = c.deltaTime / 1000
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

  get tired() {
    return this.stamina <= 0
  }

  get maxStamina() {
    return 1
  }

  get staminaRefillPerHour() {
    return 0.3
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
