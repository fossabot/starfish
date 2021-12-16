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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
        math_1.default.lerp(1, 4, totalMunitionsSkill / 100) *
        math_1.default.lerp(0.8, 1, weapon.repair || 1) *
        math_1.default.randomBetween(0.9, 1.1));
}
function getBaseDurabilityLossPerTick(maxHp, reliability, useLevel = 1) {
    return (((0.001 / maxHp) * math_1.default.lerp(1, 0.5, useLevel / 100)) /
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
    return math_1.default.lerp(0.002 * flatMod, 0.005 * flatMod, level / 100);
}
function getThrustMagnitudeForSingleCrewMember(level = 1, engineThrustMultiplier = 1, baseEngineThrustMultiplier = 1) {
    const min = 0.45;
    const max = 1.4;
    return (math_1.default.lerp(min, max, level / 100) *
        engineThrustMultiplier *
        baseEngineThrustMultiplier);
}
function getPassiveThrustMagnitudePerTickForSingleCrewMember(level = 1, engineThrustMultiplier = 1, baseEngineThrustMultiplier = 1) {
    const min = 1 / 4500;
    const max = 1 / 1500;
    return (math_1.default.lerp(min, max, level / 100) *
        engineThrustMultiplier *
        baseEngineThrustMultiplier);
}
function getRepairAmountPerTickForSingleCrewMember(level) {
    return (math_1.default.lerp(0.55, 2, level / 100) / globals_1.default.tickInterval);
}
function getMineAmountPerTickForSingleCrewMember(level) {
    return (math_1.default.lerp(180, 500, level / 100) / globals_1.default.tickInterval);
}
function getResearchAmountPerTickForSingleCrewMember(level) {
    return (math_1.default.lerp(150, 800, level / 100) / globals_1.default.tickInterval);
}
function getStaminaGainPerTickForSingleCrewMember(baseStaminaUse, rechargeSpeedMultiplier) {
    return baseStaminaUse * rechargeSpeedMultiplier;
}
function getWeaponCooldownReductionPerTick(level) {
    return (2 + math_1.default.lerp(1, 10, level / 100)) * 15;
}
/**
 * Returns a multiplier (1 being the baseline) that incorporates general improvement when alone AND when with friends
 */
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
function getPlanetDefenseRadius(level) {
    return math_1.default.lerp(0.03, 2, level / 100);
}
function getPlanetDefenseDamage(level) {
    return math_1.default.r2(math_1.default.lerp(0.6, 10, level / 100) *
        math_1.default.randomBetween(0.8, 1.2));
}
function statToString(data) {
    const { stat, amount } = data;
    let titleString = text_1.default.camelCaseToWords(stat);
    let amountString = `${text_1.default.numberWithCommas(math_1.default.r2(amount *
        (stat.toLowerCase().includes(`hp`) ||
            stat.toLowerCase().includes(`damage`)
            ? gameConstants_1.default.displayHPMultiplier
            : 1), 0))}`;
    let suffix = ``;
    if ([`highestSpeed`, `totalSpeedApplied`].includes(stat))
        amountString = text_1.default.speedNumber(amount);
    if ([`totalResearched`].includes(stat))
        amountString = text_1.default.abbreviateNumber(amount);
    if ([`planetTime`, `timeInBunk`].includes(stat))
        amountString = text_1.default.msToTimeString(amount * globals_1.default.tickInterval);
    if ([`distanceTraveled`].includes(stat))
        suffix = `AU`;
    return `${text_1.default
        .capitalize(titleString)
        .replace(`Hp`, `HP`)}: ${amountString}${suffix}`;
}
function getPlanetTitle(planet) {
    if (!planet || !planet.level)
        return ``;
    let names = [];
    if (planet.planetType === `mining`)
        names = [
            `Wasteland`,
            `Sands`,
            `Barrens`,
            `Raw Wilds`,
            `Wilds`,
            `Outcrops`,
            `Fertile Grounds`,
            `Open Pits`,
            `Sheltered Pits`,
            `Hollows`,
            `Rich Hollows`,
            `Depths`,
            `Quarries`,
            `Tiered Quarries`,
            `Machined Quarries`,
            `Raw Shafts`,
            `Shafts`,
            `Rich Shafts`,
            `Bare Caverns`,
            `Caverns`,
            `Tiered Caverns`,
            `Cave Systems`,
            `Extractors`,
            `Automated Extractors`,
            `Labyrinths`,
            `Deep Labyrinths`,
            `Ancient Labyrinths`,
            `Gilded Halls`,
            `Morian Halls`,
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
            `Wharf`,
            `Dockyard`,
            `Landing`,
            `Municipality`,
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
const cargoBuyPriceProximityLimit = 0.97;
function getCargoSellPrice(cargoId, planet, guildId, amount = 1, charismaLevel = 1, ignoreProximityLimit = false) {
    const buyPrice = getCargoBuyPrice(cargoId, planet, guildId, 1, charismaLevel).credits || 0;
    const charismaMultiplier = 1 +
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const sellMultiplier = (planet?.vendor?.cargo?.find((cbb) => cbb.id === cargoId && cbb.sellMultiplier)?.sellMultiplier ||
        gameConstants_1.default.baseCargoSellMultiplier) *
        charismaMultiplier *
        (planet.priceFluctuator || 1) *
        ((planet.allegiances?.find((a) => a.guildId === guildId)
            ?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? 1 + (1 - (gameConstants_1.default.guildVendorMultiplier || 1))
            : 1);
    return {
        credits: ignoreProximityLimit
            ? Math.floor((cargo[cargoId].basePrice.credits || 0) *
                amount *
                sellMultiplier)
            : Math.min(Math.floor(buyPrice * amount * cargoBuyPriceProximityLimit), Math.floor((cargo[cargoId].basePrice.credits || 0) *
                amount *
                sellMultiplier)),
    };
}
function getCargoBuyPrice(cargoId, planet, guildId, amount = 1, charismaLevel = 1) {
    const cargoForSale = planet?.vendor?.cargo?.find((cfs) => cfs.id === cargoId && cfs.buyMultiplier);
    if (!cargoForSale)
        return { credits: 99999 };
    const charismaMultiplier = 1 -
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const multiplier = cargoForSale.buyMultiplier *
        (planet.priceFluctuator || 1) *
        ((planet.allegiances?.find((a) => a.guildId === guildId)
            ?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1) *
        charismaMultiplier;
    const basePrice = cargo[cargoId].basePrice;
    const price = {};
    if (basePrice?.credits)
        price.credits = Math.ceil(basePrice.credits * multiplier * amount);
    if (basePrice?.crewCosmeticCurrency)
        price.crewCosmeticCurrency = Math.ceil(basePrice.crewCosmeticCurrency * multiplier * amount);
    if (basePrice?.shipCosmeticCurrency)
        price.shipCosmeticCurrency = Math.ceil(basePrice.shipCosmeticCurrency * multiplier * amount);
    return price;
}
function getRepairPrice(planet, hp, guildId) {
    return {
        credits: math_1.default.r2((planet.vendor?.repairCostMultiplier || 1) *
            gameConstants_1.default.baseRepairCost *
            hp *
            (planet.priceFluctuator || 1) *
            ((planet.allegiances?.find((a) => a.guildId === guildId)?.level || 0) >=
                gameConstants_1.default.guildAllegianceFriendCutoff
                ? gameConstants_1.default.guildVendorMultiplier
                : 1), 0, true),
    };
}
function getCrewPassivePrice(passiveForSale, currentIntensity, planet, guildId, charismaLevel = 1) {
    const charismaMultiplier = 1 -
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const multiplier = passiveForSale.buyMultiplier *
        (passiveForSale.intensity /
            (crewPassives_1.default[passiveForSale.id].buyable
                ?.baseIntensity || 1)) *
        (1 +
            (currentIntensity /
                (crewPassives_1.default[passiveForSale.id].buyable
                    ?.baseIntensity || 1)) **
                1.5) *
        (planet.priceFluctuator || 1) *
        ((planet.allegiances?.find((a) => a.guildId === guildId)
            ?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1) *
        charismaMultiplier;
    const basePrice = {
        ...crewPassives_1.default[passiveForSale.id].buyable?.basePrice,
    };
    const scaledCrewCosmeticCurrency = crewPassives_1.default[passiveForSale.id].buyable
        ?.scaledCrewCosmeticCurrency;
    const addScaledCrewCosmeticCurrency = scaledCrewCosmeticCurrency?.fromLevel !== undefined &&
        currentIntensity /
            (crewPassives_1.default[passiveForSale.id].buyable
                ?.baseIntensity || 1) -
            (scaledCrewCosmeticCurrency?.fromLevel || 0) +
            1 >
            0;
    const price = {};
    if (basePrice?.credits)
        price.credits = Math.ceil(basePrice.credits * multiplier);
    if (basePrice?.crewCosmeticCurrency ||
        addScaledCrewCosmeticCurrency)
        price.crewCosmeticCurrency = Math.ceil(((basePrice?.crewCosmeticCurrency || 0) +
            (scaledCrewCosmeticCurrency?.amount || 0)) *
            multiplier);
    if (basePrice?.shipCosmeticCurrency)
        price.shipCosmeticCurrency = Math.ceil(basePrice.shipCosmeticCurrency * multiplier);
    return price;
}
function getItemBuyPrice(itemForSale, planet, guildId, charismaLevel = 1) {
    const charismaMultiplier = 1 -
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const multiplier = itemForSale.buyMultiplier *
        (planet.priceFluctuator || 1) *
        ((planet.allegiances?.find((a) => a.guildId === guildId)
            ?.level || 0) >=
            gameConstants_1.default.guildAllegianceFriendCutoff
            ? gameConstants_1.default.guildVendorMultiplier
            : 1) *
        charismaMultiplier;
    const price = {};
    if (items[itemForSale.type][itemForSale.id]?.basePrice
        ?.credits)
        price.credits = Math.ceil(items[itemForSale.type][itemForSale.id].basePrice
            .credits * multiplier);
    if (items[itemForSale.type][itemForSale.id]?.basePrice
        ?.crewCosmeticCurrency)
        price.crewCosmeticCurrency = Math.ceil(items[itemForSale.type][itemForSale.id].basePrice
            .crewCosmeticCurrency * multiplier);
    if (items[itemForSale.type][itemForSale.id]?.basePrice
        ?.shipCosmeticCurrency)
        price.shipCosmeticCurrency = Math.ceil(items[itemForSale.type][itemForSale.id].basePrice
            .shipCosmeticCurrency * multiplier);
    return price;
}
const itemSellPriceBoostPerLevel = 0.1;
function getItemSellPrice(itemType, itemId, planet, guildId, itemLevel = 1, charismaLevel = 1) {
    const levelMultiplier = 1 + (itemLevel - 1) * itemSellPriceBoostPerLevel;
    const charismaMultiplier = 1 +
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const itemData = items[itemType][itemId];
    if (!itemData)
        return 9999999;
    return math_1.default.r2((itemData?.basePrice?.credits || 0) *
        gameConstants_1.default.baseItemSellMultiplier *
        (planet.priceFluctuator || 1) *
        (planet.allegiances?.find((a) => a.guildId === guildId) || gameConstants_1.default.guildAllegianceFriendCutoff < 0
            ? 1 + (1 - gameConstants_1.default.guildVendorMultiplier || 1)
            : 1) *
        charismaMultiplier *
        levelMultiplier, 0, true);
}
function getChassisSwapPrice(chassis, planet, currentChassisId, guildId, charismaLevel = 1) {
    const charismaMultiplier = 1 -
        math_1.default.lerp(0, gameConstants_1.default.maxCharismaVendorMultiplier, (charismaLevel - 1) / 100);
    const multiplier = chassis.buyMultiplier *
        (planet.priceFluctuator || 1) *
        (planet.allegiances?.find((a) => a.guildId === guildId) || gameConstants_1.default.guildAllegianceFriendCutoff < 0
            ? 1 + (1 - gameConstants_1.default.guildVendorMultiplier || 1)
            : 1) *
        charismaMultiplier;
    const currentChassisSellPrice = Math.floor(((items.chassis[currentChassisId]?.basePrice || {})
        .credits || 0) * gameConstants_1.default.baseItemSellMultiplier);
    const price = {};
    price.credits = math_1.default.r2(Math.max((items.chassis[chassis.id]?.basePrice.credits || 0) *
        multiplier -
        currentChassisSellPrice, 0), 0, true);
    if (items.chassis[chassis.id]?.basePrice
        ?.crewCosmeticCurrency)
        price.crewCosmeticCurrency = Math.ceil(items.chassis[chassis.id].basePrice
            .crewCosmeticCurrency * multiplier);
    if (items.chassis[chassis.id]?.basePrice
        ?.shipCosmeticCurrency)
        price.shipCosmeticCurrency = Math.ceil(items.chassis[chassis.id].basePrice
            .shipCosmeticCurrency * multiplier);
    return price;
}
function getGuildChangePrice(ship) {
    if (!ship.guildId)
        return {};
    if (!ship.planet)
        return { credits: 999999 };
    const multiplier = 3000 * (ship.planet?.priceFluctuator || 1);
    return {
        credits: math_1.default.r2((ship.crewMembers?.length || 1) * multiplier, 0, true),
        shipCosmeticCurrency: 1 +
            math_1.default.r2((ship.crewMembers?.length || 1) / 10, 0, true),
    };
}
function getPlanetPopulation(planet) {
    if (!planet)
        return 0;
    return math_1.default.r2(((planet &&
        planet.name
            .split(``)
            .reduce((t, c) => t + c.charCodeAt(0), 0) % 200) +
        20) **
        ((planet.level || 1) / 20) *
        (planet.radius || 100000), 0);
}
function canAfford(price, ship, crewMember, useShipCommonCredits = false) {
    if (price.credits) {
        if (!useShipCommonCredits &&
            (crewMember?.credits || 0) < price.credits)
            return false;
        if (useShipCommonCredits &&
            crewMember &&
            ship.captain !== crewMember?.id)
            return false;
        if (useShipCommonCredits &&
            (ship.commonCredits || 0) < price.credits)
            return false;
    }
    if ((ship.shipCosmeticCurrency || 0) <
        (price.shipCosmeticCurrency || 0))
        return false;
    if (price.shipCosmeticCurrency &&
        crewMember &&
        ship.captain !== crewMember?.id)
        return false;
    if ((crewMember?.crewCosmeticCurrency || 0) <
        (price?.crewCosmeticCurrency || 0))
        return false;
    return Math.min(price.credits
        ? useShipCommonCredits
            ? ship.commonCredits || 0
            : (crewMember?.credits || 0) / price.credits
        : Infinity, price.shipCosmeticCurrency
        ? (ship.shipCosmeticCurrency || 0) /
            price.shipCosmeticCurrency
        : Infinity, price.crewCosmeticCurrency
        ? (crewMember?.crewCosmeticCurrency || 0) /
            price.crewCosmeticCurrency
        : Infinity);
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
    getResearchAmountPerTickForSingleCrewMember,
    getMaxCockpitChargeForSingleCrewMember,
    getCockpitChargePerTickForSingleCrewMember,
    getThrustMagnitudeForSingleCrewMember,
    getPassiveThrustMagnitudePerTickForSingleCrewMember,
    getStaminaGainPerTickForSingleCrewMember,
    getWeaponCooldownReductionPerTick,
    getGeneralMultiplierBasedOnCrewMemberProximity,
    statToString,
    getPlanetTitle,
    getPlanetPopulation,
    cargoBuyPriceProximityLimit,
    getCargoSellPrice,
    getCargoBuyPrice,
    getRepairPrice,
    getCrewPassivePrice,
    getItemBuyPrice,
    getItemSellPrice,
    itemSellPriceBoostPerLevel,
    getChassisSwapPrice,
    getGuildChangePrice,
    canAfford,
    // getPlanetDescription,
    getPlanetDefenseRadius,
    getPlanetDefenseDamage,
};
//# sourceMappingURL=game.js.map