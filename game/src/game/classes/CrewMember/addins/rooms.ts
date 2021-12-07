import c from '../../../../../../common/dist'
import type { Item } from '../../Ship/Item/Item'
import type { MiningPlanet } from '../../Planet/MiningPlanet'
import type { CrewMember } from '../CrewMember'

export function cockpit(this: CrewMember): void {
  if (this.cockpitCharge >= 1) return

  const chargeBoost =
    this.ship.getPassiveIntensity(
      `boostCockpitChargeSpeed`,
    ) +
    this.getPassiveIntensity(`boostCockpitChargeSpeed`) +
    1

  const generalBoostMultiplier =
    c.getGeneralMultiplierBasedOnCrewMemberProximity(
      this,
      this.ship.crewMembers,
    )

  const isInTutorialMultiplier = this.ship.tutorial
    ?.currentStep
    ? 10
    : 1

  this.cockpitCharge +=
    c.getCockpitChargePerTickForSingleCrewMember(
      this.dexterity?.level || 1,
    ) *
    chargeBoost *
    generalBoostMultiplier *
    isInTutorialMultiplier
  if (this.cockpitCharge > 1) this.cockpitCharge = 1
  this.toUpdate.cockpitCharge = this.cockpitCharge
}

export function repair(this: CrewMember) {
  const chargeBoost =
    this.getPassiveIntensity(`boostRepairSpeed`) + 1 // * ship passive repair speed is handled in main ship repair function since it can come from other sources

  const generalBoostMultiplier =
    c.getGeneralMultiplierBasedOnCrewMemberProximity(
      this,
      this.ship.crewMembers,
    )

  const previousShipHp = this.ship.hp
  const repairAmount =
    c.getRepairAmountPerTickForSingleCrewMember(
      this.strength.level,
    ) *
    chargeBoost *
    generalBoostMultiplier
  const { overRepair, totalRepaired } = this.ship.repair(
    repairAmount,
    this.repairPriority,
  )

  this.addStat(`totalHpRepaired`, totalRepaired)

  if (this.ship.maxHp - previousShipHp > 0.01) {
    this.addXp(`strength`) // don't give xp for forever topping up something like the scanner which constantly loses a drip of repair
    this.toUpdate.skills = this.skills
  }
}

export function lab(this: CrewMember) {
  const generalBoostMultiplier =
    c.getGeneralMultiplierBasedOnCrewMemberProximity(
      this,
      this.ship.crewMembers,
    )

  if (!this.researchTargetId)
    this.recalculateResearchTargetId()
  if (!this.researchTargetId) return

  const researchTarget = this.ship.items.find(
    (i) =>
      i.upgradable &&
      i.id === this.researchTargetId &&
      (i.upgradeRequirements.find((r) => r.research)
        ?.current || 0) <
        (i.upgradeRequirements.find((r) => r.research)
          ?.required || 0),
  )
  if (!researchTarget) {
    this.researchTargetId = null
    this.toUpdate.researchTargetId = null
    return
  }

  const researchAmount =
    c.getResearchAmountPerTickForSingleCrewMember(
      this.intellect.level,
    ) * generalBoostMultiplier

  const amountResearched =
    researchTarget.applyResearchTowardsUpgrade(
      researchAmount,
    )

  this.addStat(`totalResearched`, amountResearched)
  if (amountResearched) this.addXp(`intellect`)
}

export function weapons(this: CrewMember): void {
  // ----- charge weapons -----
  const chargeableWeapons = this.ship.weapons.filter(
    (w) => w.cooldownRemaining > 0,
  )
  if (!chargeableWeapons.length) return

  const passiveMultiplier =
    this.getPassiveIntensity(`boostWeaponChargeSpeed`) +
    this.ship.getPassiveIntensity(
      `boostWeaponChargeSpeed`,
    ) +
    1

  const generalBoostMultiplier =
    c.getGeneralMultiplierBasedOnCrewMemberProximity(
      this,
      this.ship.crewMembers,
    )
  // c.log({ passiveMultiplier, generalBoostMultiplier })

  const amountToReduceCooldowns =
    c.getWeaponCooldownReductionPerTick(
      this.dexterity?.level || 1,
    ) *
    passiveMultiplier *
    generalBoostMultiplier
  // / chargeableWeapons.length
  chargeableWeapons.forEach((cw) => {
    cw._stub = null // invalidate stub
    cw.cooldownRemaining -= amountToReduceCooldowns
    if (cw.cooldownRemaining < 0) cw.cooldownRemaining = 0
  })

  this.addXp(`dexterity`)
  this.toUpdate.skills = this.skills
}

export function mine(this: CrewMember): void {
  if (
    this.ship.planet &&
    (this.ship.planet as MiningPlanet).mine
  ) {
    const passiveSpeedBonus =
      this.ship.getPassiveIntensity(`boostMineSpeed`) +
      this.getPassiveIntensity(`boostMineSpeed`) +
      1

    const generalBoostMultiplier =
      c.getGeneralMultiplierBasedOnCrewMemberProximity(
        this,
        this.ship.crewMembers,
      )

    const amountToMine =
      c.getMineAmountPerTickForSingleCrewMember(
        this.strength.level || 1,
      ) *
      passiveSpeedBonus *
      generalBoostMultiplier

    ;(this.ship.planet as MiningPlanet).mineResource(
      this.minePriority,
      amountToMine,
    )

    this.addXp(`strength`)
    this.toUpdate.skills = this.skills
  }
}

export function bunk(this: CrewMember): void {
  this.addStat(`timeInBunk`, 1)

  const generalBoostMultiplier =
    c.getGeneralMultiplierBasedOnCrewMemberProximity(
      this,
      this.ship.crewMembers,
    )

  // * drip feed of cockpit charge
  if (this.cockpitCharge < 1) {
    const percentOfNormalChargeToGive = 0.1

    const chargeBoost =
      this.ship.getPassiveIntensity(
        `boostCockpitChargeSpeed`,
      ) +
      this.getPassiveIntensity(`boostCockpitChargeSpeed`) +
      1
    this.cockpitCharge +=
      c.getCockpitChargePerTickForSingleCrewMember(
        this.dexterity?.level || 1,
      ) *
      chargeBoost *
      percentOfNormalChargeToGive *
      generalBoostMultiplier

    if (this.cockpitCharge > 1) this.cockpitCharge = 1
    this.toUpdate.cockpitCharge = this.cockpitCharge
  }

  if (this.stamina >= this.maxStamina) {
    if (this.fullyRestedTarget) {
      this.goTo(this.fullyRestedTarget, true)
      this.fullyRestedTarget = false
      this.toUpdate.fullyRestedTarget = false
    }
    return
  }

  const boostStaminaRegenPassives =
    this.ship.getPassiveIntensity(
      `boostStaminaRegeneration`,
    ) +
    this.getPassiveIntensity(`boostStaminaRegeneration`) +
    1

  const staminaToAdd =
    c.getStaminaGainPerTickForSingleCrewMember(
      this.ship.game?.settings.baseStaminaUse ||
        c.defaultGameSettings.baseStaminaUse,
      this.ship.game?.settings.staminaRechargeMultiplier ||
        c.defaultGameSettings.staminaRechargeMultiplier,
    ) *
    boostStaminaRegenPassives *
    generalBoostMultiplier *
    (this.bottomedOutOnStamina
      ? this.ship.game?.settings
          .staminaBottomedOutChargeMultiplier ||
        c.defaultGameSettings
          .staminaBottomedOutChargeMultiplier
      : 1)

  this.stamina += staminaToAdd

  if (this.stamina > this.maxStamina)
    this.stamina = this.maxStamina

  if (
    this.bottomedOutOnStamina &&
    this.stamina >
      (this.ship.game?.settings
        .staminaBottomedOutResetPoint ||
        c.defaultGameSettings.staminaBottomedOutResetPoint)
  ) {
    this.bottomedOutOnStamina = false
    this.toUpdate.bottomedOutOnStamina = false
  }

  this.toUpdate.stamina = this.stamina
}
