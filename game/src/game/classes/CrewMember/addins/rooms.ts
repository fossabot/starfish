import c from '../../../../../../common/dist'
import { stubify } from '../../../../server/io'
import { Weapon } from '../../Item/Weapon'
import { CrewMember } from '../CrewMember'

export function cockpit(this: CrewMember): void {
  if (
    this.ship.canMove &&
    this.targetLocation &&
    !this.ship.isAt(this.targetLocation)
  )
    this.addXp(`piloting`)

  // * actual movement handled by Ship class
}

export function repair(this: CrewMember): void {
  const repairableItems = this.ship.items.filter(
    (i) => i.repair < 1,
  )
  if (repairableItems.length) {
    const amountToRepair =
      ((this.mechanics?.level || 1) * c.deltaTime) /
      repairableItems.length /
      1000 /
      100
    repairableItems.forEach((ri) => {
      ri.repair += amountToRepair
      if (ri.repair > 1) ri.repair = 1
    })
    this.addXp(`mechanics`)
  }
}

export function weapons(this: CrewMember): void {
  // todo auto attack in CombatShip based on crew's targets/strategies

  // charge weapons
  const chargeableWeapons = this.ship.weapons.filter(
    (w) => w.cooldownRemaining > 0,
  )
  if (chargeableWeapons.length) {
    const amountToReduceCooldowns =
      ((this.munitions?.level || 1) * c.deltaTime) /
      chargeableWeapons.length
    chargeableWeapons.forEach((cw) => {
      cw.cooldownRemaining -= amountToReduceCooldowns
    })
    this.addXp(`munitions`)
  }
}

export function bunk(this: CrewMember): void {
  this.stamina +=
    (c.deltaTime / 1000 / 60 / 60) *
    this.staminaRefillPerHour

  if (this.stamina > this.maxStamina)
    this.stamina = this.maxStamina
}
