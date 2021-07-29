"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basePassiveData = {
    addBaseArmor: {
        toString: (intensity) => `+${intensity * 100}% base armor`,
    },
    boostAttackWithNumberOfFactionMembersWithinDistance: {
        toString: (intensity, distance) => `+${intensity * 100}% attack damage per ally within ${distance}AU`,
    },
    boostBroadcastRange: {
        toString: (intensity) => `+${intensity} broadcast range`,
    },
    boostCargoSpace: {
        toString: (intensity) => `+${intensity} cargo space for crew members`,
    },
    boostChassisAgility: {
        toString: (intensity) => `+${intensity * 100}% ship agility`,
    },
    boostDropAmount: {
        toString: (intensity) => `+${intensity * 100}% drop amounts`,
    },
    boostDropRarity: {
        toString: (intensity) => `+${intensity * 100}% drop rarity`,
    },
    boostRepairSpeed: {
        toString: (intensity) => `+${intensity}% faster repairs`,
    },
    boostRestSpeed: {
        toString: (intensity) => `+${intensity * 100}% faster rest`,
    },
    boostScanRange: {
        toString: (intensity) => `+${intensity}% scan range`,
    },
    boostSightRange: {
        toString: (intensity) => `+${intensity}% sight range`,
    },
    boostCockpitChargeSpeed: {
        toString: (intensity) => `+${intensity * 100}% cockpit charge speed`,
    },
    // boostThrust: {
    //   toString: (intensity) =>
    //     `+${intensity * 100}% more thrust`,
    // },
    boostXpGain: {
        toString: (intensity) => `+${intensity * 100}% faster xp gain`,
    },
    disguiseChassisType: {
        toString: (intensity) => `Chassis type hidden`,
    },
    disguiseCrewMemberCount: {
        toString: (intensity) => `Crew member count hidden`,
    },
    extraEquipmentSlots: {
        toString: (intensity) => `+${intensity} item slot${intensity === 1 ? `` : `s`}`,
    },
    flatDamageReduction: {
        toString: (intensity) => `+${intensity} flat damage reduction`,
    },
    flatSkillBoost: {
        toString: (intensity) => `+${intensity} crew skill levels`,
    },
};
exports.default = basePassiveData;
//# sourceMappingURL=basePassiveData.js.map