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
    },
    description: (data: CrewPassiveData) =>
      `Boost personal cargo capacity by ${math.r2(
        data.intensity || 0,
      )} tons, assuming that your ship's chassis can support the weight.`,
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
    displayName: `Nesting Instinct`,
    id: `boostRepairSpeed`,
    description: (data: CrewPassiveData) =>
      `Boost repair speed by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostStaminaRegeneration: {
    displayName: `Sleep-Swimmer`,
    id: `boostStaminaRegeneration`,
    description: (data: CrewPassiveData) =>
      `Boost stamina regeneration by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostThrust: {
    displayName: `Hydrodynamic`,
    id: `boostThrust`,
    description: (data: CrewPassiveData) =>
      `Boost thrust by ${math.r2(
        (data.intensity || 0) * 100,
      )}%`,
  },

  boostWeaponChargeSpeed: {
    displayName: `Sharpened Claws`,
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
    displayName: `School Mentality`,
    id: `generalImprovementPerCrewMemberInSameRoom`,
    description: (data: CrewPassiveData) =>
      `Improved performance in any room by ${math.r2(
        (data.intensity || 0) * 100,
      )}% per other crew member with you`,
  },

  generalImprovementWhenAlone: {
    displayName: `Lone Hunter`,
    id: `generalImprovementWhenAlone`,
    description: (data: CrewPassiveData) =>
      `${math.r2(
        (data.intensity || 0) * 100,
      )}% improved performance when alone in a room`,
  },
}
export default data
