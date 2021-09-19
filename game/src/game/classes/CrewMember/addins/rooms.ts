import c from '../../../../../../common/dist'
import type { Item } from '../../Item/Item'
import type { MiningPlanet } from '../../Planet/MiningPlanet'
import type { CrewMember } from '../CrewMember'

export function cockpit(this: CrewMember): void {
  if (this.cockpitCharge >= 1) return

  const chargeBoost =
    this.ship.passives
      .filter((p) => p.id === `boostCockpitChargeSpeed`)
      .reduce((total, p) => (p.intensity || 0) + total, 0) +
    1
  this.cockpitCharge +=
    c.getCockpitChargePerTickForSingleCrewMember(
      this.piloting?.level || 1,
    ) * chargeBoost
  if (this.cockpitCharge > 1) this.cockpitCharge = 1
  this.toUpdate.cockpitCharge = this.cockpitCharge
}

export function repair(this: CrewMember) {
  const repairAmount =
    c.getRepairAmountPerTickForSingleCrewMember(
      this.mechanics?.level || 1,
    )
  const { overRepair, totalRepaired } = this.ship.repair(
    repairAmount,
    this.repairPriority,
  )

  this.addStat(`totalHpRepaired`, totalRepaired)

  if (!overRepair) {
    this.addXp(`mechanics`) // don't give xp for forever topping up something like the scanner which constantly loses a drip of repair
    this.toUpdate.skills = this.skills
  }
}

export function weapons(this: CrewMember): void {
  // ----- charge weapons -----
  const chargeableWeapons = this.ship.weapons.filter(
    (w) => w.cooldownRemaining > 0,
  )
  if (!chargeableWeapons.length) return
  const amountToReduceCooldowns =
    c.getWeaponCooldownReductionPerTick(
      this.munitions?.level || 1,
    ) / chargeableWeapons.length
  chargeableWeapons.forEach((cw) => {
    cw._stub = null // invalidate stub
    cw.cooldownRemaining -= amountToReduceCooldowns
    if (cw.cooldownRemaining < 0) cw.cooldownRemaining = 0
  })

  this.addXp(`munitions`)
  this.toUpdate.skills = this.skills
}

export function mine(this: CrewMember): void {
  if (
    this.ship.planet &&
    (this.ship.planet as MiningPlanet).mine
  ) {
    const amountToMine =
      c.getMineAmountPerTickForSingleCrewMember(
        this.mining.level || 1,
      )

    ;(this.ship.planet as MiningPlanet).mineResource(
      this.minePriority,
      amountToMine,
    )

    this.addXp(`mining`)
    this.toUpdate.skills = this.skills
  }
}

export function bunk(this: CrewMember): void {
  if (this.stamina >= this.maxStamina) return

  const staminaRefillBoost =
    this.ship.passives
      .filter((p) => p.id === `boostStaminaRegeneration`)
      .reduce((total, p) => (p.intensity || 0) + total, 0) +
    1

  this.stamina +=
    (c.getStaminaGainPerTickForSingleCrewMember() *
      staminaRefillBoost) /
    (c.deltaTime / c.tickInterval)

  if (this.stamina > this.maxStamina)
    this.stamina = this.maxStamina

  this.toUpdate.stamina = this.stamina
}
