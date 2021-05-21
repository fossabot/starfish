import c from '../../../../../../common/dist'
import type { Item } from '../../Item/Item'
import type { CrewMember } from '../CrewMember'

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
    const itemsToRepair: Item[] = []

    if (this.repairPriority === `engines`) {
      const repairableEngines = repairableItems.filter(
        (i) => i.type === `engine`,
      )
      itemsToRepair.push(...repairableEngines)
    } else if (this.repairPriority === `weapons`) {
      const repairableWeapons = repairableItems.filter(
        (i) => i.type === `weapon`,
      )
      itemsToRepair.push(...repairableWeapons)
    }
    if (
      itemsToRepair.length === 0 ||
      this.repairPriority === `most damaged`
    )
      itemsToRepair.push(
        repairableItems.reduce(
          (mostBroken, ri) =>
            ri.repair < mostBroken.repair ? ri : mostBroken,
          repairableItems[0],
        ),
      )

    const amountToRepair =
      (c.getRepairAmountPerTickForSingleCrewMember(
        this.mechanics?.level || 1,
      ) *
        c.deltaTime) /
      c.TICK_INTERVAL /
      itemsToRepair.length

    // c.log(
    //   this.repairPriority,
    //   amountToRepair,
    //   itemsToRepair.map((i) => i.type),
    // )

    itemsToRepair.forEach((ri) => {
      ri.repair = (ri.hp + amountToRepair) / ri.maxHp
      if (ri.repair > 1) {
        ri.repair = 1
        if (ri.announceWhenRepaired)
          this.ship.logEntry(
            `Your ${ri.displayName} is fully repaired.`,
            `medium`,
          )
        ri.announceWhenRepaired = false
      } else if (ri.repair < 0.9)
        ri.announceWhenRepaired = true
    })
    this.addXp(`mechanics`)
    this.ship.toUpdate._hp = this.ship.hp
  }
}

export function weapons(this: CrewMember): void {
  // ----- charge weapons -----
  const chargeableWeapons = this.ship.weapons.filter(
    (w) => w.cooldownRemaining > 0,
  )
  if (chargeableWeapons.length) {
    const amountToReduceCooldowns =
      ((this.munitions?.level || 1) * c.deltaTime) /
      chargeableWeapons.length
    chargeableWeapons.forEach((cw) => {
      cw.cooldownRemaining -= amountToReduceCooldowns
      if (cw.cooldownRemaining < 0) cw.cooldownRemaining = 0
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
