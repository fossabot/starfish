"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = __importDefault(require("./math"));
const globals_1 = __importDefault(require("./globals"));
const text_1 = __importDefault(require("./text"));
const cargo = __importStar(require("./cargo"));
const crewPassives_1 = __importDefault(require("./crewPassives"));
const items = __importStar(require("./items"));
const gameConstants_1 = __importDefault(require("./gameConstants"));
function getHitDamage(weapon, totalMunitionsSkill = 0) {
    return (weapon.damage *
        math_1.default.lerp(1, 4, totalMunitionsSkill / 100));
}
function getBaseDurabilityLossPerTick(maxHp, reliability, useLevel = 1) {
    return ((0.00001 *
        gameConstants_1.default.gameSpeedMultiplier *
        (10 / maxHp) *
        math_1.default.lerp(1, 0.5, useLevel / 100)) /
        reliability);
}
function getRadiusDiminishingReturns(totalValue, equipmentCount) {
    if (equipmentCount === 0)
        return 0;
    return totalValue / Math.sqrt(equipmentCount) || 0; // this might be too harsh? 5 and 2 = 4.9
}
function getMaxCockpitChargeForSingleCrewMember(level = 1) {
    return 1;
    // return math.lerp(1, 5, (level - 1) / 100)
}
function getCockpitChargePerTickForSingleCrewMember(level = 1) {
    const flatMod = 0.1;
    return (math_1.default.lerp(0.0002 * flatMod, 0.0005 * flatMod, level / 100) * gameConstants_1.default.gameSpeedMultiplier);
}
function getThrustMagnitudeForSingleCrewMember(level = 1, engineThrustMultiplier = 1, baseEngineThrustMultiplier) {
    const min = 0.65;
    const max = 1.5;
    return (math_1.default.lerp(min, max, level / 100) *
        engineThrustMultiplier *
        baseEngineThrustMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(0.1, 0.3, level / 100) /
        globals_1.default.tickInterval) *
        gameConstants_1.default.gameSpeedMultiplier);
}
function getMineAmountPerTickForSingleCrewMember(level) {
    return ((math_1.default.lerp(30, 100, level / 100) /
        globals_1.default.tickInterval) *
        gameConstants_1.default.gameSpeedMultiplier);
}
function getStaminaGainPerTickForSingleCrewMember(baseStaminaUse) {
    return baseStaminaUse * 1.5;
}
function getWeaponCooldownReductionPerTick(level) {
    return ((2 + math_1.default.lerp(1, 20, level / 100)) *
        3 *
        gameConstants_1.default.gameSpeedMultiplier);
}
function getGeneralMultiplierBasedOnCrewMemberProximity(cm, crewMembers) {
    const boostPerMemberInSameRoom = cm.passives
        .filter((p) => p.id ===
        `generalImprovementPerCrewMemberInSameRoom`)
        .reduce((total, p) => (p.intensity || 0) + total, 0);
    const boostForSolo = cm.passives
        .filter((p) => p.id === `generalImprovementWhenAlone`)
        .reduce((total, p) => (p.intensity || 0) + total, 0);
    if (!boostForSolo && !boostPerMemberInSameRoom)
        return 1;
    const crewMembersInSameRoom = crewMembers.filter((m) => cm.id !== m.id && cm.location === m.location);
    if (crewMembersInSameRoom.length === 0)
        return boostForSolo + 1;
    return (boostPerMemberInSameRoom *
        crewMembersInSameRoom.length +
        1);
}
function statToString(data) {
    const { stat, amount } = data;
    let titleString = text_1.default.camelCaseToWords(stat);
    let amountString = `${text_1.default.numberWithCommas(math_1.default.r2(amount))}`;
    let suffix = ``;
    if ([`highestSpeed`].includes(stat))
        amountString = text_1.default.speedNumber(amount);
    if ([`planetTime`, `timeInBunk`].includes(stat))
        amountString = text_1.default.msToTimeString(amount * globals_1.default.tickInterval);
    if ([`distanceTraveled`].includes(stat))
        suffix = `AU`;
    return `${text_1.default.capitalize(titleString)}: ${amountString}${suffix}`;
}
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
function getCargoSellPrice(cargoId, planet, amount, guildId) {
    const buyPrice = getCargoBuyPrice(cargoId, planet, amount, guildId);
    const sellMultiplier = planet?.vendor?.cargo?.find((cbb) => cbb.id === cargoId && cbb.sellMultiplier)?.sellMultiplier ||
        gameConstants_1.default.baseCargoSellMultiplier;
    return Math.min(buyPrice, Math.floor(cargo[cargoId].basePrice *
        sellMultiplier *
        amount *
        planet.priceFluctuator *
        ((planet.allegiances.find((a) => a.guildId === guildId)?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? 1 +
                (1 - (gameConstants_1.default.guildVendorMultiplier || 1))
            : 1)));
}
function getCargoBuyPrice(cargoId, planet, amount, guildId) {
    const cargoForSale = planet?.vendor?.cargo?.find((cfs) => cfs.id === cargoId && cfs.buyMultiplier);
    if (!cargoForSale)
        return 99999;
    return Math.ceil(cargo[cargoId].basePrice *
        cargoForSale.buyMultiplier *
        amount *
        planet?.priceFluctuator *
        ((planet.allegiances.find((a) => a.guildId === guildId)?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1));
}
function getRepairPrice(planet, hp, guildId) {
    return math_1.default.r2((planet.vendor?.repairCostMultiplier || 1) *
        gameConstants_1.default.baseRepairCost *
        hp *
        planet.priceFluctuator *
        ((planet.allegiances.find((a) => a.guildId === guildId)?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1), 0, true);
}
function getCrewPassivePrice(passiveForSale, currentIntensity, planet, guildId) {
    return Math.ceil((crewPassives_1.default[passiveForSale.id].buyable?.basePrice ||
        99999) *
        passiveForSale.buyMultiplier *
        (1 +
            (currentIntensity /
                (crewPassives_1.default[passiveForSale.id].buyable
                    ?.baseIntensity || 1)) **
                2) *
        planet.priceFluctuator *
        ((planet.allegiances.find((a) => a.guildId === guildId)?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1));
}
function getItemBuyPrice(itemForSale, planet, guildId) {
    return math_1.default.r2((items[itemForSale.type][itemForSale.id].basePrice ||
        1) *
        itemForSale.buyMultiplier *
        planet.priceFluctuator *
        ((planet.allegiances.find((a) => a.guildId === guildId)?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1), 0, true);
}
function getItemSellPrice(itemType, itemId, planet, guildId) {
    const itemData = items[itemType][itemId];
    if (!itemData)
        return 9999999;
    return math_1.default.r2((itemData?.basePrice || 9999999) *
        gameConstants_1.default.baseItemSellMultiplier *
        planet.priceFluctuator *
        (planet.guild === guildId
            ? 1 + (1 - gameConstants_1.default.guildVendorMultiplier || 1)
            : 1), 0, true);
}
function getChassisSwapPrice(chassis, planet, currentChassisId, guildId) {
    const currentChassisSellPrice = Math.floor((items.chassis[currentChassisId]?.basePrice || 0) *
        gameConstants_1.default.baseItemSellMultiplier);
    return math_1.default.r2(Math.min((items.chassis[chassis.id]?.basePrice || 1) *
        chassis.buyMultiplier *
        planet.priceFluctuator *
        (planet.guild === guildId
            ? 1 +
                (1 - gameConstants_1.default.guildVendorMultiplier || 1)
            : 1) -
        currentChassisSellPrice), 0, true);
}
function getGuildChangePrice(ship) {
    if (!ship.guildId)
        return 0;
    if (!ship.planet)
        return 999999;
    return math_1.default.r2((ship.crewMembers?.length || 1) *
        3000 *
        ship.planet.priceFluctuator *
        (ship.planet.guild === ship.guildId
            ? 1 + (1 - gameConstants_1.default.guildVendorMultiplier || 1)
            : 1), 0, true);
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
    getHitDamage,
    getBaseDurabilityLossPerTick,
    getRadiusDiminishingReturns,
    getRepairAmountPerTickForSingleCrewMember,
    getMineAmountPerTickForSingleCrewMember,
    getMaxCockpitChargeForSingleCrewMember,
    getCockpitChargePerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    getGeneralMultiplierBasedOnCrewMemberProximity,
    statToString,
    getPlanetTitle,
    getPlanetPopulation,
    getCargoSellPrice,
    getCargoBuyPrice,
    getRepairPrice,
    getCrewPassivePrice,
    getItemBuyPrice,
    getItemSellPrice,
    getChassisSwapPrice,
    getGuildChangePrice,
};
//# sourceMappingURL=game.js.map