import math from './math'

const data: {
  [key in CrewPassiveId]: CrewPassiveData
} = {
  cargoSpace: {
    displayName: `Cargo Space`,
    id: `cargoSpace`,
    buyable: {
      rarity: 1,
      basePrice: 1000,
      baseIntensity: 10,
      wholeNumbersOnly: true,
    },
    description: (data: CrewPassiveData) =>
      `Boost personal cargo capacity by ${math.r2(
        data.intensity || 0,
      )} tons (if your ship's chassis can support it)`,
  },

  boostCockpitChargeSpeed: {
    displayName: `Dorsal Fins`,
    id: `boostCockpitChargeSpeed`,
    description: (data: CrewPassiveData) =>
      `Boost engine charge speed by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostBrake: {
    displayName: `Grappling Claws`,
    id: `boostBrake`,
    description: (data: CrewPassiveData) =>
      `Boost brake power by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostBroadcastRange: {
    displayName: `Echolocation`,
    id: `boostBroadcastRange`,
    description: (data: CrewPassiveData) =>
      `Boost personal broadcast range by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostDropAmounts: {
    displayName: `Nutrient Fitration`,
    id: `boostDropAmounts`,
    description: (data: CrewPassiveData) =>
      `Boost your share of drop amounts by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostMineSpeed: {
    displayName: `Sharp Pincers`,
    id: `boostMineSpeed`,
    description: (data: CrewPassiveData) =>
      `Boost mine speed by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostRepairSpeed: {
    displayName: `Tool Belt`,
    id: `boostRepairSpeed`,
    description: (data: CrewPassiveData) =>
      `Boost repair speed by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  reduceStaminaDrain: {
    displayName: `Endurance`,
    id: `reduceStaminaDrain`,
    description: (data: CrewPassiveData) =>
      `Reduce stamina drain by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostStaminaRegeneration: {
    displayName: `REM Booster`,
    id: `boostStaminaRegeneration`,
    description: (data: CrewPassiveData) =>
      `Boost stamina regeneration by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostThrust: {
    displayName: `Hydrodynamics`,
    id: `boostThrust`,
    description: (data: CrewPassiveData) =>
      `Boost thrust by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostWeaponChargeSpeed: {
    displayName: `Sharpened Points`,
    id: `boostWeaponChargeSpeed`,
    description: (data: CrewPassiveData) =>
      `Boost weapon charge speed by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostXpGain: {
    displayName: `Developed Cerebrum`,
    id: `boostXpGain`,
    description: (data: CrewPassiveData) =>
      `Boost xp gain by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  lessDamageOnEquipmentUse: {
    displayName: `Nimble Appendages`,
    id: `lessDamageOnEquipmentUse`,
    description: (data: CrewPassiveData) =>
      `Reduce item damage on use by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  generalImprovementPerCrewMemberInSameRoom: {
    displayName: `Squad Training`,
    id: `generalImprovementPerCrewMemberInSameRoom`,
    description: (data: CrewPassiveData) =>
      `Improved performance in any room by ${math.r2(
        (data.intensity || 0) * 100,
      )}% per other crew member with you`,
  },

  generalImprovementWhenAlone: {
    displayName: `Solo Training`,
    id: `generalImprovementWhenAlone`,
    description: (data: CrewPassiveData) =>
      `${math.r2(
        (data.intensity || 0) * 100,
      )}% improved performance when alone in a room`,
  },
}
export default data
