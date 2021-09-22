"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const text_1 = __importDefault(require("./text"));
const gameShipLimit = 100;
const gameSpeedMultiplier = 10;
const baseSightRange = 0.05;
const baseBroadcastRange = 0.002;
const baseRepairCost = 600;
const maxBroadcastLength = 200;
const baseStaminaUse = 0.00001 * gameSpeedMultiplier;
const baseXpGain = 0.05 * gameSpeedMultiplier;
const itemPriceMultiplier = 400;
const factionVendorMultiplier = 0.98;
const factionAllegianceFriendCutoff = 50;
const baseItemSellMultiplier = 0.6;
const noEngineThrustMagnitude = 0.02;
const aiDifficultyMultiplier = 0.5;
const planetContributeCostPerXp = 10;
const attackRemnantExpireTime = (1000 * 60 * 60 * 24 * 7) / gameSpeedMultiplier;
const cacheExpireTime = (1000 * 60 * 60 * 24 * 7 * 10) / gameSpeedMultiplier;
const supportServerLink = `https://discord.gg/aEKE3bFR6n`;
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
    faction: [`ai`, `name`, `id`, `color`],
    species: [`id`, `singular`, `icon`],
    chassis: [`displayName`],
};
const sameFactionShipScanProperties = {
    _hp: true,
    _maxHp: true,
};
const tactics = [`aggressive`, `defensive`];
function getHitDamage(weapon, totalMunitionsSkill = 0) {
    return (weapon.damage *
        math_1.default.lerp(1, 4, totalMunitionsSkill / 100));
}
function getBaseDurabilityLossPerTick(maxHp, reliability) {
    return ((0.00001 * gameSpeedMultiplier * (10 / maxHp)) /
        reliability);
}
function getRadiusDiminishingReturns(totalValue, equipmentCount) {
    if (equipmentCount === 0)
        return 0;
    return totalValue / Math.sqrt(equipmentCount) || 0; // this might be too harsh? 5 and 2 = 4.9
}
const brakeToThrustRatio = 5;
function getMaxCockpitChargeForSingleCrewMember(level = 1) {
    return 1;
    // return math.lerp(1, 5, (level - 1) / 100)
}
function getCockpitChargePerTickForSingleCrewMember(level = 1) {
    const flatMod = 0.1;
    return (math_1.default.lerp(0.0002 * flatMod, 0.0005 * flatMod, level / 100) * gameSpeedMultiplier);
}
const baseEngineThrustMultiplier = gameSpeedMultiplier * 0.1;
function getThrustMagnitudeForSingleCrewMember(level = 1, engineThrustMultiplier = 1) {
    const min = 0.65;
    const max = 1.5;
    return (math_1.default.lerp(min, max, level / 100) *
        engineThrustMultiplier *
        baseEngineThrustMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(0.1, 0.3, level / 100) /
        globals_1.default.tickInterval) *
        gameSpeedMultiplier);
}
function getMineAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(30, 100, level / 100) /
        globals_1.default.tickInterval) *
        gameSpeedMultiplier);
}
function getStaminaGainPerTickForSingleCrewMember() {
    return baseStaminaUse * 1.5;
}
function getWeaponCooldownReductionPerTick(level) {
    return ((2 + math_1.default.lerp(1, 20, level / 100)) *
        3 *
        gameSpeedMultiplier);
}
function getCrewPassivePriceMultiplier(level) {
    return 1 + level ** 2;
}
const baseCargoSellMultiplier = 0.3;
function statToString(data) {
    const { stat, amount } = data;
    let titleString = text_1.default.camelCaseToWords(stat);
    let amountString = math_1.default.r2(amount);
    let suffix = ``;
    if ([`planetTime`].includes(stat)) {
        amountString = math_1.default.r2(amount / 1000 / 60, 0, true);
        suffix = `h`;
    }
    if ([`distanceTraveled`].includes(stat))
        suffix = `AU`;
    return `${text_1.default.capitalize(titleString)}: ${text_1.default.numberWithCommas(amountString)}${suffix}`;
}
const taglineOptions = [
    `Alpha Tester`,
    `Tester`,
    `✨Supporter✨`,
    `🔨Admin🔨`,
    // to be assigned
    `Big Flipper`,
    `Whale, I'll be!`,
    `Splish Splash`,
    `Holy Mackerel!`,
    `Small Pond 4 Life`,
    `Nautical Nonsense`,
    `Very Shallow`,
    // flight (implemented)
    `River Runner`,
    `Hell's Angelfish`,
    `Flying Fish`,
    // todo more flight taglines for distance traveled
    // exploration (implemented)
    `Small Pond Paddler`,
    `Current Rider`,
    `Migratory`,
    `EAC-zy Rider`,
    // credits (implemented)
    `Easy Target`,
    `Moneybags`,
    // bunk (implemented)
    `Nap Champions`,
    // upgrade to x chassis
    `Big Kahuna`,
    // planet time
    `Home Schooled`,
    // combat achievements
    `Nibbler`,
    `On the Hunt`,
    `Blood in the Water`,
    `Feeding Frenzied`,
    `Venomous`,
    `Big Chompers`,
    `Bait and Switch`,
    // sleep time
    `Bottom Feeder`,
    // dying (implemented)
    `Delicious with Lemon`,
    // crew member numbers (implemented)
    `Guppy`,
    `Schoolin'`,
    `Pod`,
    `Big Fish`,
];
const headerBackgroundOptions = [
    { id: `Default`, url: `default.jpg` },
    { id: `Blue Faction 1`, url: `blue1.svg` },
    { id: `Purple Faction 1`, url: `purple1.svg` },
    { id: `Green Faction 1`, url: `green1.svg` },
    { id: `Blue Faction 2`, url: `blue2.svg` },
    { id: `Purple Faction 2`, url: `purple2.svg` },
    { id: `Green Faction 2`, url: `green2.svg` },
    { id: `Flat 1`, url: `flat1.svg` },
    { id: `Flat 2`, url: `flat2.svg` },
    { id: `Stone Cold 1`, url: `gradient1.svg` },
    { id: `Crimson Blur`, url: `gradient2.svg` },
    { id: `Lightspeedy`, url: `gradient3.svg` },
    { id: `Constellation 1`, url: `stars1.jpg` },
    { id: `Gravestone 1`, url: `vintage1.jpg` },
];
function getPlanetTitle(planet) {
    if (!planet || !planet.level)
        return ``;
    let names = [];
    if (planet.planetType === `mining`)
        names = [
            `Wasteland`,
            `Barrens`,
            `Raw Wilds`,
            `Wilds`,
            // `Fertile Grounds`,
            `Outcrops`,
            `Open Pits`,
            `Sheltered Pits`,
            `Hollows`,
            `Quarries`,
            `Tiered Quarries`,
            `Raw Shafts`,
            `Rich Shafts`,
            `Bare Caverns`,
            `Caverns`,
            `Cave Systems`,
            `Rich Veins`,
            `Extractors`,
            `Labyrinths`,
            `Gilded Halls`,
        ];
    if (planet.planetType === `basic`)
        names = [
            `Wilderness`,
            `Frontier`,
            `Vanguard`,
            `Outpost`,
            `Trading Post`,
            `Community`,
            `Settlement`,
            `Colony`,
            `Municipality`,
            `Dockyard`,
            `Landing`,
            `Trade Hub`,
            `Ecosystem`,
            `Skyport`,
            `Spaceport`,
            `Cosmic Quayage`,
            `Cosmodrome`,
            `Ecopolis`,
            `Metropolis`,
            `Cosmopolis`,
            `Megalopolis`,
            `Sector Hub`,
            `Galactic Marina`,
            `Stellar Waypoint`,
            `Galactic Nucleus`,
        ];
    return names[Math.floor(planet.level - 1)] || `Domain`;
    // todo finish
}
function getPlanetPopulation(planet) {
    if (!planet)
        return 0;
    return math_1.default.r2(((planet &&
        planet.name
            .split(``)
            .reduce((t, c) => t + c.charCodeAt(0), 0) % 200) +
        20) **
        (planet.level / 30) *
        planet.radius, 0);
}
// function getPlanetDescription(planet: PlanetStub): string {
//   if (!planet) return ``
//   const cargoCount = planet.vendor?.cargo?.length
//   const itemsCount = (planet.vendor as PlanetVendor)?.items
//     ?.length
//   const chassisCount = (planet.vendor as PlanetVendor)
//     ?.chassis?.length
//   let d = `The ${getPlanetTitle(
//     planet,
//   ).toLowerCase()} known as ${planet.name} is a ${
//     planet.radius > 50000
//       ? `large`
//       : planet.radius > 30000
//       ? `medium-sized`
//       : `small`
//   } planet`
//   const positiveLeanings = (
//     (planet.leanings as PlanetLeaning[]) || []
//   ).filter((l) => !l.never && (l.propensity || 0) > 0.5)
//   d += positiveLeanings.length
//     ? ` that specializes in selling ${text.printList(
//         positiveLeanings.map((l) =>
//           [
//             `weapon`,
//             `engine`,
//             `scanner`,
//             `communicator`,
//             `repair`,
//           ].includes(l.type)
//             ? l.type + `s`
//             : l.type,
//         ),
//       )}.`
//     : `.`
//   d +=
//     planet.creatures && planet.creatures.length
//       ? ` It is inhabited by a population of ${text.numberWithCommas(
//           getPlanetPopulation(planet),
//         )} ${text.printList(planet.creatures || [])}.`
//       : ``
//   // todo finish
//   return d
// }
exports.default = {
    supportServerLink,
    gameShipLimit,
    gameSpeedMultiplier,
    baseSightRange,
    baseBroadcastRange,
    baseRepairCost,
    maxBroadcastLength,
    baseStaminaUse,
    baseXpGain,
    factionVendorMultiplier,
    factionAllegianceFriendCutoff,
    itemPriceMultiplier,
    baseItemSellMultiplier,
    noEngineThrustMagnitude,
    aiDifficultyMultiplier,
    planetContributeCostPerXp,
    attackRemnantExpireTime,
    cacheExpireTime,
    baseShipScanProperties,
    sameFactionShipScanProperties,
    getHitDamage,
    getBaseDurabilityLossPerTick,
    getRadiusDiminishingReturns,
    getRepairAmountPerTickForSingleCrewMember,
    getMineAmountPerTickForSingleCrewMember,
    brakeToThrustRatio,
    getMaxCockpitChargeForSingleCrewMember,
    getCockpitChargePerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    baseEngineThrustMultiplier,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    getCrewPassivePriceMultiplier,
    tactics,
    baseCargoSellMultiplier,
    taglineOptions,
    statToString,
    headerBackgroundOptions,
    getPlanetTitle,
    getPlanetPopulation,
};
//# sourceMappingURL=game.js.map