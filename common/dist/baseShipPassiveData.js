"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const baseShipPassiveData = {
    boostDamage: {
        description: (p) => `${(p.intensity || 1) * 100}% increased damage`,
    },
    alwaysSeeTrailColors: {
        description: (p) => `Trail colors always visible`,
    },
    boostDamageWhenNoAlliesWithinDistance: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% attack damage when no allies are within ${p.data?.distance}AU`,
    },
    boostDamageWithNumberOfGuildMembersWithinDistance: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% attack damage per ally within ${p.data?.distance}AU`,
    },
    boostCargoSpace: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(p.intensity || 1)} cargo space for crew members`,
    },
    boostChassisAgility: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% dodge chance`,
    },
    boostDropAmount: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% drop amounts`,
    },
    boostDropRarity: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% AI drop rarity`,
    },
    boostRepairSpeed: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% faster repairs`,
    },
    boostMineSpeed: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% faster mining`,
    },
    boostMinePayouts: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% higher mining payouts`,
    },
    boostScanRange: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% scan range`,
    },
    boostSightRange: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% sight range`,
    },
    boostBroadcastRange: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% broadcast range`,
    },
    boostCockpitChargeSpeed: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% cockpit charge speed`,
    },
    boostBrake: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% ship braking`,
    },
    // boostThrust: {
    //   toString: (p) =>
    //     `${(p.intensity || 1) >=0 ? '+' : ''}${Math.round((p.intensity || 1) * 100)}% more thrust`,
    // },
    boostXpGain: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% faster XP gain`,
    },
    disguiseChassisType: {
        description: (p) => `Chassis type hidden`,
    },
    disguiseCrewMemberCount: {
        description: (p) => `Crew member count hidden`,
    },
    extraEquipmentSlots: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(p.intensity || 1)} item slot${Math.round(p.intensity || 1) === 1 ? `` : `s`}`,
    },
    boostDamageToItemType: {
        description: (p) => `${(p.intensity || 0) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% damage to ${p.data?.type}s`,
    },
    scaledDamageReduction: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% damage reduction`,
    },
    flatDamageReduction: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${p.intensity || 1} HP flat damage reduction`,
    },
    flatSkillBoost: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round(p.intensity || 1)} crew skill levels`,
    },
    boostStaminaRegeneration: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 100)}% faster stamina regeneration`,
    },
    autoRepair: {
        description: (p) => `${(p.intensity || 1) >= 0 ? `+` : ``}${Math.round((p.intensity || 1) * 10) / 10}HP/hr ${(p.intensity || 1) >= 0
            ? `auto-repair`
            : `damage over time`}`,
    },
};
exports.default = baseShipPassiveData;
//# sourceMappingURL=baseShipPassiveData.js.map