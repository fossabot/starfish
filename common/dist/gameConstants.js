"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultGameSettings = {
    id: `game` + `${Math.random()}`.substring(2),
    humanShipLimit: 100,
    safeZoneRadius: 2.5,
    contractLocationRadius: 0.7,
    baseXpGain: 0.4,
    baseStaminaUse: 0.0001,
    staminaRechargeMultiplier: 1,
    staminaBottomedOutResetPoint: 0.05,
    staminaBottomedOutChargeMultiplier: 1,
    newCrewMemberCredits: 1000,
    gravityMultiplier: 1.8,
    gravityCurveSteepness: 10,
    gravityRadius: 0.5,
    brakeToThrustRatio: 5,
    baseEngineThrustMultiplier: 1,
    arrivalThreshold: 0.002,
    baseCritChance: 0.01,
    baseCritDamageMultiplier: 2,
    planetDensity: 0.9,
    cometDensity: 0.08,
    zoneDensity: 1.15,
    aiShipDensity: 3,
    cacheDensity: 1.5,
    aiDifficultyMultiplier: 0.5,
};
const baseCurrencySingular = `speso`;
const baseCurrencyPlural = `spesos`;
const shipCosmeticCurrencySingular = `bubbloon`;
const shipCosmeticCurrencyPlural = `bubbloons`;
const crewCosmeticCurrencySingular = `squidcoin`;
const crewCosmeticCurrencyPlural = `squidcoin`;
const baseSightRange = 0.05;
const baseBroadcastRange = 0.002;
const baseRepairCost = 600;
const maxBroadcastLength = 200;
const defaultHomeworldLevel = 12;
const itemUpgradeMultiplier = 0.02;
const itemPriceMultiplier = 400;
const itemMassMultiplier = 10;
const weaponDamageMultiplier = 1;
const guildVendorMultiplier = 0.98;
const guildAllegianceFriendCutoff = 50;
const baseItemSellMultiplier = 0.6;
const noEngineThrustMagnitude = 0.02;
const planetContributeCostPerXp = 1;
const planetContributeShipCosmeticCostPerXp = 0.00005;
const planetContributeCrewCosmeticCostPerXp = 0.05;
const planetLevelXpRequirementMultiplier = 15;
const attackRemnantExpireTime = 1000 * 60 * 60 * 24 * 0.35;
const cacheExpireTime = 1000 * 60 * 60 * 24 * 7 * 1.5;
const zoneExpireTime = 1000 * 60 * 60 * 24 * 7 * 4;
const supportServerLink = `https://discord.gg/aEKE3bFR6n`;
const userIsOfflineTimeout = 1000 * 60 * 60;
const baseShipScanProperties = {
    id: true,
    name: true,
    human: true,
    ai: true,
    headerBackground: true,
    tagline: true,
    level: true,
    dead: true,
    attackable: true,
    previousLocations: true,
    location: true,
    planet: [`name`, `location`],
    guildId: true,
    chassis: [`displayName`],
};
const sameGuildShipScanProperties = {
    _hp: true,
    _maxHp: true,
};
const tactics = [
    `aggressive`,
    `defensive`,
    `onlyNonPlayers`,
    `onlyPlayers`,
    `pacifist`,
];
const baseCargoSellMultiplier = 0.3;
exports.default = {
    defaultGameSettings,
    baseCurrencySingular,
    baseCurrencyPlural,
    shipCosmeticCurrencySingular,
    shipCosmeticCurrencyPlural,
    crewCosmeticCurrencySingular,
    crewCosmeticCurrencyPlural,
    supportServerLink,
    baseSightRange,
    baseBroadcastRange,
    baseRepairCost,
    defaultHomeworldLevel,
    maxBroadcastLength,
    guildVendorMultiplier,
    guildAllegianceFriendCutoff,
    userIsOfflineTimeout,
    baseItemSellMultiplier,
    noEngineThrustMagnitude,
    planetContributeCostPerXp,
    planetContributeShipCosmeticCostPerXp,
    planetContributeCrewCosmeticCostPerXp,
    planetLevelXpRequirementMultiplier,
    itemUpgradeMultiplier,
    itemPriceMultiplier,
    itemMassMultiplier,
    weaponDamageMultiplier,
    attackRemnantExpireTime,
    cacheExpireTime,
    zoneExpireTime,
    baseShipScanProperties,
    sameGuildShipScanProperties,
    tactics,
    baseCargoSellMultiplier,
};
//# sourceMappingURL=gameConstants.js.map