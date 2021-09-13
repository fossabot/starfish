const basePassiveData: {
  [key in ShipPassiveEffectType]: {
    toString: (p: ShipPassiveEffect) => string
  }
} = {
  boostAttackWithNumberOfFactionMembersWithinDistance: {
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
      )}% ai drop rarity`,
  },
  boostRepairSpeed: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster repairs`,
  },
  boostRestSpeed: {
    toString: (p) =>
      `+${Math.round(
        (p.intensity || 1) * 100,
      )}% faster rest`,
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
      )} broadcast range`,
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
}
export default basePassiveData
