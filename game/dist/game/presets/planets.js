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
exports.generatePlanet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const factions_1 = __importDefault(require("./factions"));
const crewPassives_1 = require("./crewPassives");
const cargo_1 = require("./cargo");
const itemData = __importStar(require("./items"));
function generatePlanet(game, homeworldFactionKey) {
    let name;
    const possibleNames = [...planetNames];
    while (!name && possibleNames.length) {
        const chosenIndex = Math.floor(Math.random() * possibleNames.length);
        let thisName = possibleNames[chosenIndex];
        possibleNames.splice(chosenIndex, 1);
        if (thisName &&
            game.planets.find((p) => p.name === thisName))
            thisName = undefined;
        name = thisName;
    }
    if (!name)
        return false;
    let locationSearchRadius = game.gameSoftRadius * 0.75;
    const tooClose = 0.1;
    let location = [0, 0];
    const isTooClose = (p) => dist_1.default.distance(location, p.location) < tooClose;
    while (game.planets.find(isTooClose) ||
        game.humanShips.find(isTooClose)) {
        location = dist_1.default.randomInsideCircle(locationSearchRadius);
        locationSearchRadius *= 1.01;
    }
    const radius = Math.floor(Math.random() * 60000 + 10000);
    let factionId;
    if (homeworldFactionKey)
        factionId = homeworldFactionKey;
    else {
        if (Math.random() > 0.6)
            factionId = dist_1.default.randomFromArray(Object.keys(factions_1.default));
        if (factionId === `red`)
            factionId = undefined;
    }
    const color = factionId
        ? factions_1.default[factionId].color
        : `hsl(${Math.random() * 360}, ${Math.round(Math.random() * 80 + 20)}%, ${Math.round(Math.random() * 40) + 30}%)`;
    const repairCostMultiplier = dist_1.default.r2(1 + Math.random() * 0.2 - 0.1, 3);
    const vendor = {
        cargo: [],
        passives: [],
        actives: [],
        items: [],
        chassis: [],
    };
    const level = dist_1.default.distance([0, 0], location);
    const maxRarity = level;
    const minRarity = level / 4;
    const cargoDispropensity = 0.8 - Math.random();
    const passiveDispropensity = 1 - Math.random() / 2;
    const itemDispropensity = 1 - Math.random() / 2;
    const chassisDispropensity = 1 - Math.random() / 2;
    for (let d of Object.values(cargo_1.data)) {
        if (d.rarity > maxRarity)
            continue;
        if (Math.random() > cargoDispropensity) {
            const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers();
            vendor.cargo.push({
                cargoType: d.type,
                buyMultiplier,
                sellMultiplier,
            });
        }
    }
    for (let d of Object.values(crewPassives_1.data)) {
        if (d.rarity > maxRarity || d.rarity < minRarity)
            continue;
        if (Math.random() > passiveDispropensity) {
            const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers();
            vendor.passives.push({
                passiveType: d.type,
                buyMultiplier,
            });
        }
    }
    for (let d of [
        ...Object.values(itemData.armor),
        ...Object.values(itemData.engine),
        ...Object.values(itemData.weapon),
        ...Object.values(itemData.scanner),
        ...Object.values(itemData.communicator),
    ]) {
        const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers(true);
        // vendors will buy any item, but only sell a few
        const itemForSale = {
            itemType: d.type,
            itemId: d.id,
            sellMultiplier,
        };
        if (d.rarity < maxRarity &&
            d.rarity > minRarity &&
            Math.random() > itemDispropensity)
            itemForSale.buyMultiplier = buyMultiplier;
        vendor.items.push(itemForSale);
    }
    for (let d of Object.values(itemData.chassis)) {
        if (d.rarity > maxRarity || d.rarity < minRarity)
            continue;
        if (Math.random() > chassisDispropensity) {
            const { buyMultiplier, sellMultiplier } = getBuyAndSellMultipliers();
            vendor.chassis.push({
                chassisType: d.id,
                buyMultiplier,
                sellMultiplier,
            });
        }
    }
    const creatures = [];
    while (creatures.length === 0 || Math.random() > 0.5) {
        const viableCreatures = factionId
            ? seaCreatures.filter((s) => s.factionKey === factionId)
            : seaCreatures;
        const chosen = dist_1.default.randomFromArray(viableCreatures);
        if (!creatures.find((cre) => cre === chosen))
            creatures.push(chosen.name);
    }
    return {
        name,
        color,
        creatures,
        factionId,
        homeworld: homeworldFactionKey
            ? { id: homeworldFactionKey }
            : undefined,
        radius,
        location,
        vendor,
        repairCostMultiplier,
    };
}
exports.generatePlanet = generatePlanet;
function getBuyAndSellMultipliers(item = false) {
    const buyMultiplier = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
    const sellMultiplier = Math.min(buyMultiplier * dist_1.default.factionVendorMultiplier, dist_1.default.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3)) * (item ? 0.4 : 1);
    return { buyMultiplier, sellMultiplier };
}
const planetNames = [
    `Osiris`,
    `Neptune`,
    `Cancer`,
    `Lapis`,
    `Lazuli`,
    `Senara`,
    `Pethea`,
    `Mara`,
    `Trinda`,
    `Raitis`,
    `Chanus`,
    `Siunia`,
    `Bion`,
    `Zonoe`,
    `Zeon`,
    `Lyria`,
    `Churia`,
    `Ozuno`,
    `Deron`,
    `Melion`,
    `Norix`,
    `Aqua`,
    `Solio`,
    `Kogars`,
    `Yaria`,
    `Bolla`,
    `Io`,
    `Artemis`,
    `Hera`,
    `Exodus`,
    `Bonia`,
    `Phides`,
    `Auster`,
    `Sirius`,
    `Alpha`,
    `Beta`,
    `Omega`,
    `Kappa`,
    `Zeta`,
    `Delta`,
    `Cronus`,
    `Adonis`,
    `Lethe`,
    `Circe`,
    `Thrace`,
    `Pluto`,
    `Achilles`,
    `Hermes`,
    `Zenra`,
    // todo MORE
];
const seaCreatures = [
    { name: `crabs`, factionKey: `green` },
    { name: `oysters`, factionKey: `green` },
    { name: `clams`, factionKey: `green` },
    { name: `abalones`, factionKey: `green` },
    { name: `barnacles`, factionKey: `green` },
    { name: `octopi`, factionKey: `green` },
    { name: `squids`, factionKey: `green` },
    { name: `lobsters`, factionKey: `green` },
    { name: `anemones`, factionKey: `green` },
    { name: `jellyfish`, factionKey: `green` },
    { name: `urchins`, factionKey: `green` },
    { name: `sharks`, factionKey: `purple` },
    { name: `seahorses`, factionKey: `purple` },
    { name: `starfish`, factionKey: `purple` },
    { name: `anglerfish`, factionKey: `purple` },
    { name: `eels`, factionKey: `purple` },
    { name: `shrimp`, factionKey: `purple` },
    { name: `corals`, factionKey: `purple` },
    { name: `narwhals`, factionKey: `purple` },
    { name: `cod`, factionKey: `purple` },
    { name: `mackerel`, factionKey: `purple` },
    { name: `tuna`, factionKey: `purple` },
    { name: `marlin`, factionKey: `purple` },
    { name: `swordfish`, factionKey: `purple` },
    { name: `angelfish`, factionKey: `purple` },
    { name: `clownfish`, factionKey: `purple` },
    { name: `walruses`, factionKey: `blue` },
    { name: `whales`, factionKey: `blue` },
    { name: `orcas`, factionKey: `blue` },
    { name: `seals`, factionKey: `blue` },
    { name: `blowfish`, factionKey: `blue` },
    { name: `penguins`, factionKey: `blue` },
    { name: `seagulls`, factionKey: `blue` },
    { name: `dolphins`, factionKey: `blue` },
    { name: `sea otters`, factionKey: `blue` },
    { name: `pelicans`, factionKey: `blue` },
    { name: `sea turtles`, factionKey: `blue` },
    { name: `sea lions`, factionKey: `blue` },
];
//# sourceMappingURL=planets.js.map