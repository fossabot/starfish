const basePassiveData: {
  [key in ShipPassiveEffectId]: {
    toString: (p: ShipPassiveEffect) => string
  }
} = {
  boostDamage: {
    toString: (p: ShipPassiveEffect) =>
      `${(p.intensity || 1) * 100}% increased damage`,
  },
  alwaysSeeTrailColors: {
    toString: (p: ShipPassiveEffect) =>
      `Trail colors always visible`,
  },
  boostDamageWhenNoAlliesWithinDistance: {
    toString: (p: ShipPassiveEffect) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage when no allies are within ${
        p.data?.distance
      }AU`,
  },
  boostDamageWithNumberOfFactionMembersWithinDistance: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage per ally within ${
        p.data?.distance
      }AU`,
  },
  boostCargoSpace: {
    toString: (p) =>
      `+${Math.round(
        p.intensity || 1,
      )} cargo space for crew members`,
  },
  boostChassisAgility: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% dodge chance`,
  },
  boostDropAmount: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% drop amounts`,
  },
  boostDropRarity: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% AI drop rarity`,
  },
  boostRepairSpeed: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster repairs`,
  },
  boostMineSpeed: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster mining`,
  },
  boostScanRange: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% scan range`,
  },
  boostSightRange: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% sight range`,
  },
  boostBroadcastRange: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% broadcast range`,
  },
  boostCockpitChargeSpeed: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% cockpit charge speed`,
  },
  boostBrake: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% ship braking`,
  },
  // boostThrust: {
  //   toString: (p) =>
  //     `+${Math.round((p.intensity || 1) * 100)}% more thrust`,
  // },
  boostXpGain: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster XP gain`,
  },
  disguiseChassisType: {
    toString: (p) => `Chassis type hidden`,
  },
  disguiseCrewMemberCount: {
    toString: (p) => `Crew member count hidden`,
  },
  extraEquipmentSlots: {
    toString: (p) =>
      `+${Math.round(p.intensity || 1)} item slot${
        Math.round(p.intensity || 1) === 1 ? `` : `s`
      }`,
  },
  boostDamageToItemType: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% damage to ${p.data?.type}s`,
  },
  scaledDamageReduction: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% damage reduction`,
  },
  flatDamageReduction: {
    toString: (p) =>
      `+${Math.round(
        p.intensity || 1,
      )} flat damage reduction`,
  },
  flatSkillBoost: {
    toString: (p) =>
      `+${Math.round(p.intensity || 1)} crew skill levels`,
  },
  boostStaminaRegeneration: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster stamina regeneration`,
  },
  autoRepair: {
    toString: (p) =>
      `+${
        Math.round((p.intensity || 1) * 10) / 10
      }HP/hr auto-repair`,
  },
}
export default basePassiveData
