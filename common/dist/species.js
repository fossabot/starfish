"use strict";
/*

🐌 snail
🐊 alligator
🐸 frog
🦛 hippo
🐃 water buffalo

*/
Object.defineProperty(exports, "__esModule", { value: true });
const species = {
    octopi: {
        icon: `🐙`,
        id: `octopi`,
        singular: `octopus`,
        description: `Known for their adaptibility, octopi have a natural advantage when it comes to cognition.`,
        passives: [
            {
                id: `boostXpGain`,
                data: { source: { speciesId: `octopi` } },
                intensity: 0.1,
            },
        ],
        activeTree: [
            {
                id: `boostIntellect`,
                intensity: 0.2,
            },
            {
                id: `boostDamageToScanners`,
                intensity: 0.15,
            },
            {
                id: `boostShipSightRange`,
                intensity: 0.1,
            },
            { id: `cargoSweep`, intensity: 0.2 },
            {
                id: `broadcastRangeCargoPrices`,
                intensity: 0.15,
            },
            {
                id: `damageToAllNearbyEnemies`,
                intensity: 0.14,
            },
        ],
    },
    lobsters: {
        icon: `🦞`,
        id: `lobsters`,
        singular: `lobster`,
        description: `Lobsters' speed is no issue when it comes to crushing and clamping.`,
        passives: [
            {
                id: `boostMineSpeed`,
                data: { source: { speciesId: `lobsters` } },
                intensity: 0.3,
            },
        ],
        activeTree: [
            {
                id: `boostMineSpeed`,
                intensity: 0.19,
            },
            {
                id: `generalImprovementWhenAlone`,
                intensity: 0.25,
            },
            {
                id: `boostStrength`,
                intensity: 0.22,
            },
            {
                id: `flatDamageReduction`,
                intensity: 0.15,
            },
            {
                id: `instantStamina`,
                intensity: 0.16,
            },
        ],
    },
    crabs: {
        icon: `🦀`,
        id: `crabs`,
        singular: `crab`,
        description: `Unbuffeted by the pounding of tides, crabs can gain traction anywhere.`,
        passives: [
            {
                id: `boostBrake`,
                data: { source: { speciesId: `crabs` } },
                intensity: 2,
            },
        ],
        activeTree: [
            {
                id: `boostDexterity`,
                intensity: 0.22,
            },
            { id: `boostThrust`, intensity: 0.14 },
            { id: `boostCharisma`, intensity: 0.13 },
            { id: `boostChassisAgility`, intensity: 0.2 },
            { id: `damageToAllNearbyEnemies`, intensity: 0.13 },
        ],
    },
    'sea turtles': {
        icon: `🐢`,
        id: `sea turtles`,
        singular: `sea turtle`,
        description: `Turtles may be slow, but they can keep going, and going, and going...`,
        passives: [
            {
                id: `reduceStaminaDrain`,
                data: { source: { speciesId: `sea turtles` } },
                intensity: 0.1,
            },
        ],
        activeTree: [
            { id: `flatDamageReduction`, intensity: 0.19 },
            { id: `attacksSlow`, intensity: 0.17 },
            {
                id: `instantStamina`,
                intensity: 0.15,
            },
            { id: `boostDamageToEngines`, intensity: 0.18 },
            { id: `fullCrewSkillBoost`, intensity: 0.24 },
            { id: `repairDrone`, intensity: 0.17 },
        ],
    },
    sharks: {
        icon: `🦈`,
        id: `sharks`,
        singular: `shark`,
        description: `Sharks do some of their best work solo.`,
        passives: [
            {
                id: `generalImprovementWhenAlone`,
                data: { source: { speciesId: `sharks` } },
                intensity: 0.2,
            },
        ],
        activeTree: [
            {
                id: `generalImprovementWhenAlone`,
                intensity: 0.16,
            },
            { id: `boostWeaponChargeSpeed`, intensity: 0.16 },
            { id: `boostDamageToWeapons`, intensity: 0.19 },
            {
                id: `boostDexterity`,
                intensity: 0.2,
            },
            { id: `combatDrone`, intensity: 0.21 },
            { id: `seeTrailColors`, intensity: 1 },
        ],
    },
    dolphins: {
        icon: `🐬`,
        id: `dolphins`,
        singular: `dolphin`,
        description: `The friendliest of all undersea creatures.`,
        passives: [
            {
                id: `boostBroadcastRange`,
                data: { source: { speciesId: `dolphins` } },
                intensity: 0.35,
            },
            {
                id: `boostMoraleGain`,
                data: { source: { speciesId: `dolphins` } },
                intensity: 0.2,
            },
        ],
        activeTree: [
            { id: `broadcastRangeCargoPrices`, intensity: 1 },
            {
                id: `generalImprovementPerCrewMemberInSameRoom`,
                intensity: 0.21,
            },
            {
                id: `boostCharisma`,
                intensity: 0.28,
            },
            { id: `boostMorale`, intensity: 0.21 },
            {
                id: `fullCrewSkillBoost`,
                intensity: 0.19,
            },
        ],
    },
    snails: {
        icon: `🐌`,
        id: `snails`,
        singular: `snail`,
        description: `When you carry your home with you, you get good at odd jobs around the house.`,
        passives: [
            {
                id: `boostRepairSpeed`,
                data: { source: { speciesId: `snails` } },
                intensity: 0.15,
            },
        ],
        activeTree: [
            {
                id: `repairDrone`,
                intensity: 0.2,
            },
            { id: `boostRepairSpeed`, intensity: 0.15 },
            { id: `boostWeaponChargeSpeed`, intensity: 0.17 },
            { id: `attacksSlow`, intensity: 0.19 },
            { id: `boostShipSightRange`, intensity: 0.16 },
            { id: `fullCrewSkillBoost`, intensity: 0.17 },
        ],
    },
    whales: {
        icon: `🐋`,
        id: `whales`,
        singular: `whale`,
        description: `Whales put their brawn to good use.`,
        passives: [
            {
                id: `cargoSpace`,
                data: { source: { speciesId: `whales` } },
                intensity: 30,
            },
        ],
        activeTree: [
            { id: `cargoSweep`, intensity: 0.2 },
            {
                id: `boostStrength`,
                intensity: 0.21,
            },
            {
                id: `damageToAllNearbyEnemies`,
                intensity: 0.18,
            },
            {
                id: `flatDamageReduction`,
                intensity: 0.15,
            },
            {
                id: `boostMineSpeed`,
                intensity: 0.2,
            },
        ],
    },
    angelfish: {
        icon: `🐠`,
        id: `angelfish`,
        singular: `angelfish`,
        description: `Just like their namesake, angelfish are natural-born fliers.`,
        passives: [
            {
                id: `boostCockpitChargeSpeed`,
                data: { source: { speciesId: `angelfish` } },
                intensity: 0.1,
            },
            {
                id: `boostThrust`,
                data: { source: { speciesId: `angelfish` } },
                intensity: 0.1,
            },
        ],
        activeTree: [
            { id: `boostThrust`, intensity: 0.22 },
            {
                id: `boostDexterity`,
                intensity: 0.2,
            },
            { id: `boostChassisAgility`, intensity: 0.21 },
            {
                id: `generalImprovementPerCrewMemberInSameRoom`,
                intensity: 0.16,
            },
            { id: `instantStamina`, intensity: 0.18 },
        ],
    },
    blowfish: {
        icon: `🐡`,
        id: `blowfish`,
        singular: `blowfish`,
        description: `Tired of pretending to be scary, the blowfish decided to learn their way around a weapons bay.`,
        passives: [
            {
                id: `boostWeaponChargeSpeed`,
                intensity: 0.1,
                data: { source: { speciesId: `blowfish` } },
            },
        ],
        activeTree: [
            { id: `boostWeaponChargeSpeed`, intensity: 0.21 },
            { id: `boostDexterity`, intensity: 0.19 },
            { id: `damageToAllNearbyEnemies`, intensity: 0.22 },
            { id: `boostDamageToEngines`, intensity: 0.19 },
            { id: `boostDamageToScanners`, intensity: 0.18 },
        ],
    },
    shrimp: {
        icon: `🦐`,
        id: `shrimp`,
        singular: `shrimp`,
        description: `For something so small, strength lies in numbers.`,
        passives: [
            {
                id: `generalImprovementPerCrewMemberInSameRoom`,
                intensity: 0.04,
                data: {
                    source: { speciesId: `shrimp` },
                },
            },
        ],
        activeTree: [
            {
                id: `boostMorale`,
                intensity: 0.18,
            },
            { id: `fullCrewSkillBoost`, intensity: 0.2 },
            {
                id: `generalImprovementPerCrewMemberInSameRoom`,
                intensity: 0.2,
            },
            { id: `boostCharisma`, intensity: 0.2 },
            { id: `repairDrone`, intensity: 0.2 },
        ],
    },
    eagles: {
        aiOnly: true,
        icon: `🦅`,
        id: `eagles`,
        singular: `eagle`,
        description: ``,
        passives: [],
        activeTree: [],
    },
    seagulls: {
        aiOnly: true,
        icon: `🐦`,
        id: `seagulls`,
        singular: `seagull`,
        description: ``,
        passives: [],
        activeTree: [],
    },
    chickens: {
        aiOnly: true,
        icon: `🐓`,
        id: `chickens`,
        singular: `chicken`,
        description: ``,
        passives: [],
        activeTree: [],
    },
    flamingos: {
        aiOnly: true,
        icon: `🦩`,
        id: `flamingos`,
        singular: `flamingo`,
        description: ``,
        passives: [],
        activeTree: [],
    },
    vultures: {
        aiOnly: true,
        icon: `🪶`,
        id: `vultures`,
        singular: `vulture`,
        description: ``,
        passives: [],
        activeTree: [],
    },
};
exports.default = species;
//# sourceMappingURL=species.js.map