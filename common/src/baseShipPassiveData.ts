import text from './text'
import math from './math'
import constants from './gameConstants'

const baseShipPassiveData: {
  [key in ShipPassiveEffectId]: {
    description: (p: ShipPassiveEffect) => string
  }
} = {
  visibleCargoPrices: {
    description: (p: ShipPassiveEffect) =>
      `Planet cargo prices always visible`,
  },
  broadcastRangeCargoPrices: {
    description: (p: ShipPassiveEffect) =>
      `Planet cargo prices are visible within comms range`,
  },
  boostAccuracy: {
    description: (p: ShipPassiveEffect) =>
      `${(p.intensity || 1) * 100}% ${
        (p.intensity || 1) >= 0 ? `increased` : `decreased`
      } attack accuracy`,
  },
  boostDamage: {
    description: (p: ShipPassiveEffect) =>
      `${(p.intensity || 1) * 100}% ${
        (p.intensity || 1) >= 0 ? `increased` : `decreased`
      } damage dealt`,
  },
  alwaysSeeTrailColors: {
    description: (p: ShipPassiveEffect) =>
      `Trail colors always visible`,
  },
  boostDamageWhenNoAlliesWithinDistance: {
    description: (p: ShipPassiveEffect) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage when no allies are within ${text.speedNumber(
        p.data?.distance || 0,
        true,
      )} km`,
  },
  boostDamageWithNumberOfGuildMembersWithinDistance: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% attack damage per ally within ${text.speedNumber(
        p.data?.distance || 0,
        true,
      )} km`,
  },
  boostCargoSpace: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        p.intensity || 1,
      )} cargo space for crew members`,
  },
  boostChassisAgility: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% dodge chance`,
  },
  boostDropAmount: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% drop amounts`,
  },
  boostDropRarity: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% AI drop rarity`,
  },
  boostRepairSpeed: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        Math.abs(p.intensity || 1) * 100,
      )}% ${
        (p.intensity || 1) >= 0 ? `faster` : `slower`
      } repairs`,
  },
  boostMineSpeed: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        Math.abs(p.intensity || 1) * 100,
      )}% ${
        (p.intensity || 1) >= 0 ? `faster` : `slower`
      } mining`,
  },
  boostMinePayouts: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        Math.abs(p.intensity || 1) * 100,
      )}% ${
        (p.intensity || 1) >= 0 ? `higher` : `lower`
      } mining payouts`,
  },
  boostScanRange: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% scan range`,
  },
  boostSightRange: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% sight range`,
  },
  boostBroadcastRange: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% broadcast range`,
  },
  boostCockpitChargeSpeed: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% cockpit charge speed`,
  },
  boostWeaponChargeSpeed: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% weapon charge speed`,
  },
  boostBrake: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% ship braking`,
  },
  boostThrust: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% thrust`,
  },
  boostPassiveThrust: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% auto-nav`,
  },
  boostXpGain: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        Math.abs(p.intensity || 1) * 100,
      )}% ${
        (p.intensity || 1) >= 0 ? `faster` : `slower`
      } XP gain`,
  },
  disguiseChassisType: {
    description: (p) => `Chassis type hidden`,
  },
  disguiseCrewMemberCount: {
    description: (p) => `Crew member count hidden`,
  },
  extraEquipmentSlots: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        p.intensity || 1,
      )} item slot${
        Math.round(p.intensity || 1) === 1 ? `` : `s`
      }`,
  },
  boostDamageToItemType: {
    description: (p) =>
      `${(p.intensity || 0) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% damage dealt to ${p.data?.type}s`,
  },
  scaledDamageReduction: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        Math.abs(p.intensity || 1) * 100,
      )}% damage ${
        (p.intensity || 1) >= 0
          ? `reduction`
          : `taken increase`
      }`,
  },
  flatDamageReduction: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.abs(
        p.intensity || 1,
      )} HP flat damage ${
        (p.intensity || 1) >= 0
          ? `reduction`
          : `taken increase`
      }`,
  },
  flatSkillBoost: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        p.intensity || 1,
      )} crew skill levels`,
  },
  boostStaminaRegeneration: {
    description: (p) =>
      `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(
        (p.intensity || 1) * 100,
      )}% ${
        (p.intensity || 1) >= 0 ? `faster` : `slower`
      } stamina regeneration`,
  },
  autoRepair: {
    description: (p) =>
      `${
        (p.intensity || 1) >= 0 ? `+` : ``
      }${text.numberWithCommas(
        math.r2(p.intensity || 1) *
          constants.displayHPMultiplier,
      )}HP/hr ${
        (p.intensity || 1) >= 0
          ? `auto-repair`
          : `damage over time`
      }`,
  },
}
export default baseShipPassiveData
