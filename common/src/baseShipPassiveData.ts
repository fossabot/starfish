const baseShipPassiveData: {
  [key in ShipPassiveEffectId]: {
    description: (p: ShipPassiveEffect) => string
  }
} = {
  boostDamage: {
    description: (p: ShipPassiveEffect) =>
      `${(p.intensity || 1) * 100}% increased damage`,
  },
  alwaysSeeTrailColors: {
    description: (p: ShipPassiveEffect) =>
      `Trail colors always visible`,
  },
  boostDamageWhenNoAlliesWithinDistance: {
    description: (p: ShipPassiveEffect) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage when no allies are within ${
        p.data?.distance
      }AU`,
  },
  boostDamageWithNumberOfGuildMembersWithinDistance: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage per ally within ${
        p.data?.distance
      }AU`,
  },
  boostCargoSpace: {
    description: (p) =>
      `+${Math.round(
        p.intensity || 1,
      )} cargo space for crew members`,
  },
  boostChassisAgility: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% dodge chance`,
  },
  boostDropAmount: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% drop amounts`,
  },
  boostDropRarity: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% AI drop rarity`,
  },
  boostRepairSpeed: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster repairs`,
  },
  boostMineSpeed: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster mining`,
  },
  boostMinePayouts: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% higher mining payouts`,
  },
  boostScanRange: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% scan range`,
  },
  boostSightRange: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% sight range`,
  },
  boostBroadcastRange: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% broadcast range`,
  },
  boostCockpitChargeSpeed: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% cockpit charge speed`,
  },
  boostBrake: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% ship braking`,
  },
  // boostThrust: {
  //   toString: (p) =>
  //     `+${Math.round((p.intensity || 1) * 100)}% more thrust`,
  // },
  boostXpGain: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster XP gain`,
  },
  disguiseChassisType: {
    description: (p) => `Chassis type hidden`,
  },
  disguiseCrewMemberCount: {
    description: (p) => `Crew member count hidden`,
  },
  extraEquipmentSlots: {
    description: (p) =>
      `+${Math.round(p.intensity || 1)} item slot${
        Math.round(p.intensity || 1) === 1 ? `` : `s`
      }`,
  },
  boostDamageToItemType: {
    description: (p) =>
      `${(p.intensity || 0) > 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% damage to ${p.data?.type}s`,
  },
  scaledDamageReduction: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% damage reduction`,
  },
  flatDamageReduction: {
    description: (p) =>
      `+${p.intensity || 1} HP flat damage reduction`,
  },
  flatSkillBoost: {
    description: (p) =>
      `+${Math.round(p.intensity || 1)} crew skill levels`,
  },
  boostStaminaRegeneration: {
    description: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster stamina regeneration`,
  },
  autoRepair: {
    description: (p) =>
      `+${
        Math.round((p.intensity || 1) * 10) / 10
      }HP/hr auto-repair`,
  },
}
export default baseShipPassiveData
