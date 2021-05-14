import c from '../../../../../common/dist'
import { io, stubify } from '../../../server/io'
import { HumanShip } from '../Ship/HumanShip'

export class CrewMember {
  static readonly passiveStaminaLossPerSecond = 0.0001

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
      { skill: 'stamina', level: 1, xp: 0 },
      { skill: 'piloting', level: 1, xp: 0 },
      { skill: 'munitions', level: 1, xp: 0 },
      { skill: 'mechanics', level: 1, xp: 0 },
      { skill: 'linguistics', level: 1, xp: 0 },
    ]
  }

  rename(newName: string) {
    this.name = newName
  }

  goTo(location: CrewLocation) {
    if (this.location === 'cockpit')
      this.targetLocation = null
    this.location = location
    this.lastActive = Date.now()
  }

  tick() {
    // ----- test notify listeners -----
    io.to(`ship:${this.ship.id}`).emit(
      'crew:tired',
      stubify<CrewMember, CrewMemberStub>(this),
    )

    // ----- bunk -----
    if (this.location === `bunk`) {
      this.stamina +=
        (c.deltaTime / 1000 / 60 / 60) *
        this.staminaRefillPerHour

      if (this.stamina > this.maxStamina)
        this.stamina = this.maxStamina
      return
    }

    // ----- stamina check/use -----
    if (this.tired) return

    this.stamina -=
      CrewMember.passiveStaminaLossPerSecond *
      (c.deltaTime / 1000)
    if (this.tired) {
      this.stamina = 0
      this.goTo('bunk')

      // ----- notify listeners -----
      io.to(`ship:${this.ship.id}`).emit(
        'crew:tired',
        stubify<CrewMember, CrewMemberStub>(this),
      )

      return
    }

    // ----- cockpit -----
    if (this.location === `cockpit`) {
      if (
        this.ship.canMove &&
        this.targetLocation &&
        !this.ship.isAt(this.targetLocation)
      )
        this.addXp('piloting')
    }

    // ----- repair -----
    else if (this.location === `repair`) {
      this.addXp('mechanics')
    }

    // ----- weapons -----
    else if (this.location === `weapons`) {
      this.addXp('munitions')
    }
  }

  addXp(skill: SkillName, xp?: number) {
    if (!xp) xp = c.deltaTime / 1000
    const skillElement = this.skills.find(
      (s) => s.skill === skill,
    )
    if (!skillElement)
      this.skills.push({ skill, level: 1, xp })
    else skillElement.xp += xp
  }

  get tired() {
    return this.stamina <= 0
  }

  get maxStamina() {
    return (
      this.skills?.find((s) => s.skill === `stamina`)
        ?.level || 1
    )
  }

  get staminaRefillPerHour() {
    return 0.3
  }
}
