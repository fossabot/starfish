import c from '../../../../../common/dist'
import { HumanShip } from '../Ship/HumanShip'

export class CrewMember {
  static readonly passiveStaminaLossPerSecond = 0.0001

  readonly id: string
  readonly ship: HumanShip
  name: string
  location: CrewLocation
  skills: XPData[]
  stamina: number

  constructor(data: BaseCrewMemberData, ship: HumanShip) {
    this.id = data.id
    this.ship = ship
    this.name = data.name
    this.location = data.location || `bunk`
    this.skills = data.skills
    this.stamina = data.stamina || this.maxStamina
  }

  rename(newName: string) {
    this.name = newName
  }

  goTo(location: CrewLocation) {
    this.location = location
  }

  tick() {
    if (this.location === `bunk`) {
      this.stamina +=
        (c.deltaTime / 1000 / 60 / 60) *
        this.staminaRefillPerHour

      if (this.stamina > this.maxStamina)
        this.stamina = this.maxStamina
      return
    }

    if (this.tired) return

    this.stamina -=
      CrewMember.passiveStaminaLossPerSecond *
      (c.deltaTime / 1000)
    if (this.tired) {
      this.stamina = 0
      return
    }

    if (this.location === `cockpit`) {
      c.log(`cockpit`)
    } else if (this.location === `repair`) {
      c.log(`repair`)
    } else if (this.location === `weapons`) {
      c.log(`weapons`)
    }
  }

  get tired() {
    return this.stamina <= 0
  }

  get maxStamina() {
    return (
      this.skills.find((s) => s.skill === `stamina`)
        ?.level || 1
    )
  }

  get staminaRefillPerHour() {
    return 0.3
  }
}
