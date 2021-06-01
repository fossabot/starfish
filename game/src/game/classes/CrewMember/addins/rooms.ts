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

export function repair(
  this: CrewMember,
  repairAmount?: number,
): number {
  let totalRepaired = 0
  const repairableItems = this.ship.items.filter(
    (i) => i.repair < 1,
  )
  if (!repairableItems.length) return totalRepaired
  const itemsToRepair: Item[] = []

  if (this.repairPriority === `engines`) {
    const r = repairableItems.filter(
      (i) => i.type === `engine`,
    )
    itemsToRepair.push(...r)
  } else if (this.repairPriority === `weapons`) {
    const r = repairableItems.filter(
      (i) => i.type === `weapon`,
    )
    itemsToRepair.push(...r)
  } else if (this.repairPriority === `scanners`) {
    const r = repairableItems.filter(
      (i) => i.type === `scanner`,
    )
    itemsToRepair.push(...r)
  } else if (this.repairPriority === `communicators`) {
    const r = repairableItems.filter(
      (i) => i.type === `communicator`,
    )
    itemsToRepair.push(...r)
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
    repairAmount ||
    (c.getRepairAmountPerTickForSingleCrewMember(
      this.mechanics?.level || 1,
    ) *
      (c.deltaTime / c.TICK_INTERVAL)) /
      itemsToRepair.length

  // c.log(
  //   this.repairPriority,
  //   amountToRepair,
  //   itemsToRepair.map((i) => i.type),
  // )
  itemsToRepair.forEach((ri) => {
    const previousRepair = ri.repair
    ri.repair = (ri.hp + amountToRepair) / ri.maxHp
    if (ri.repair > 1) {
      ri.repair = 1
      if (ri.announceWhenRepaired)
        this.ship.logEntry(
          `Your ${ri.displayName} is fully repaired.`,
          `medium`,
        )
      ri.announceWhenRepaired = false
    }
    if (ri.repair > 0.1) ri.announceWhenBroken = true
    if (ri.repair < 0.9) ri.announceWhenRepaired = true
    totalRepaired += ri.repair - previousRepair
  })
  this.addXp(`mechanics`)
  this.ship.updateThingsThatCouldChangeOnItemChange()
  return totalRepaired
}

export function weapons(this: CrewMember): void {
  // ----- charge weapons -----
  const chargeableWeapons = this.ship.weapons.filter(
    (w) => w.cooldownRemaining > 0,
  )
  if (chargeableWeapons.length) {
    const amountToReduceCooldowns =
      c.getWeaponCooldownReductionPerTick(
        this.munitions?.level || 1,
      ) / chargeableWeapons.length
    chargeableWeapons.forEach((cw) => {
      cw.cooldownRemaining -= amountToReduceCooldowns
      if (cw.cooldownRemaining < 0) cw.cooldownRemaining = 0
    })

    this.addXp(`munitions`)
  }
}

export function bunk(this: CrewMember): void {
  this.stamina +=
    c.getStaminaGainPerTickForSingleCrewMember() *
    (c.deltaTime / c.TICK_INTERVAL)

  if (this.stamina > this.maxStamina)
    this.stamina = this.maxStamina
}
