"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basePassiveData = {
    boostAttackWithNumberOfFactionMembersWithinDistance: {
        toString: (p) => `+${(p.intensity || 1) * 100}% attack damage per ally within ${p.data?.distance}AU`,
    },
    boostBroadcastRange: {
        toString: (p) => `+${p.intensity || 1} broadcast range`,
    },
    boostCargoSpace: {
        toString: (p) => `+${p.intensity || 1} cargo space for crew members`,
    },
    boostChassisAgility: {
        toString: (p) => `+${(p.intensity || 1) * 100}% dodge chance`,
    },
    boostDropAmount: {
        toString: (p) => `+${(p.intensity || 1) * 100}% drop amounts`,
    },
    boostDropRarity: {
        toString: (p) => `+${(p.intensity || 1) * 100}% ai drop rarity`,
    },
    boostRepairSpeed: {
        toString: (p) => `+${(p.intensity || 1) * 100}% faster repairs`,
    },
    boostRestSpeed: {
        toString: (p) => `+${(p.intensity || 1) * 100}% faster rest`,
    },
    boostScanRange: {
        toString: (p) => `+${(p.intensity || 1) * 100}% scan range`,
    },
    boostSightRange: {
        toString: (p) => `+${(p.intensity || 1) * 100}% sight range`,
    },
    boostCockpitChargeSpeed: {
        toString: (p) => `+${(p.intensity || 1) * 100}% cockpit charge speed`,
    },
    boostBrake: {
        toString: (p) => `+${(p.intensity || 1) * 100}% ship braking`,
    },
    // boostThrust: {
    //   toString: (p) =>
    //     `+${(p.intensity || 1) * 100}% more thrust`,
    // },
    boostXpGain: {
        toString: (p) => `+${(p.intensity || 1) * 100}% faster xp gain`,
    },
    disguiseChassisType: {
        toString: (p) => `Chassis type hidden`,
    },
    disguiseCrewMemberCount: {
        toString: (p) => `Crew member count hidden`,
    },
    extraEquipmentSlots: {
        toString: (p) => `+${p.intensity || 1} item slot${(p.intensity || 1) === 1 ? `` : `s`}`,
    },
    boostDamageToItemType: {
        toString: (p) => `+${(p.intensity || 1) * 100}% damage to ${p.data?.type}s`,
    },
    scaledDamageReduction: {
        toString: (p) => `+${(p.intensity || 1) * 100}% damage reduction`,
    },
    flatDamageReduction: {
        toString: (p) => `+${p.intensity || 1} flat damage reduction`,
    },
    flatSkillBoost: {
        toString: (p) => `+${p.intensity || 1} crew skill levels`,
    },
};
exports.default = basePassiveData;
//# sourceMappingURL=basePassiveData.js.map