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
    while (game.planets.find(isTooClose)) {
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
            const bm = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
            const sm = dist_1.default.r2(bm * (Math.random() * 0.2) + 0.55, 3);
            vendor.cargo.push({
                cargoType: d.type,
                buyMultiplier: bm,
                sellMultiplier: sm,
            });
        }
    }
    for (let d of Object.values(crewPassives_1.data)) {
        if (d.rarity > maxRarity || d.rarity < minRarity)
            continue;
        if (Math.random() > passiveDispropensity) {
            const bm = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
            vendor.passives.push({
                passiveType: d.type,
                buyMultiplier: bm,
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
        const bm = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
        const sm = dist_1.default.r2(bm * (Math.random() * 0.2) + 0.55, 3);
        // vendors will buy any item, but only sell a few
        const itemForSale = {
            itemType: d.type,
            itemId: d.id,
            sellMultiplier: sm,
        };
        if (d.rarity < maxRarity &&
            d.rarity > minRarity &&
            Math.random() > itemDispropensity)
            itemForSale.buyMultiplier = bm;
        vendor.items.push(itemForSale);
    }
    for (let d of Object.values(itemData.chassis)) {
        if (d.rarity > maxRarity || d.rarity < minRarity)
            continue;
        if (Math.random() > chassisDispropensity) {
            const bm = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
            const sm = dist_1.default.r2(bm * (Math.random() * 0.2) + 0.55, 3);
            vendor.chassis.push({
                chassisType: d.id,
                buyMultiplier: bm,
                sellMultiplier: sm,
            });
        }
    }
    // todo these correspond generally to faction
    const creatures = [];
    while (creatures.length === 0 || Math.random() > 0.5) {
        const chosen = dist_1.default.randomFromArray(seaCreatures);
        if (!creatures.find((cre) => cre === chosen))
            creatures.push(chosen);
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
    `crabs`,
    `seals`,
    `octopi`,
    `squids`,
    `sharks`,
    `seahorses`,
    `walruses`,
    `starfish`,
    `whales`,
    `orcas`,
    `anglerfish`,
    `eels`,
    `blowfish`,
    `penguins`,
    `jellyfish`,
    `squids`,
    `lobsters`,
    `shrimp`,
    `oysters`,
    `clams`,
    `abalones`,
    `barnacles`,
    `seagulls`,
    `dolphins`,
    `urchins`,
    `sea otters`,
    `pelicans`,
    `anemones`,
    `sea turtles`,
    `sea lions`,
    `corals`,
    `narwhals`,
    `cod`,
    `mackerel`,
    `tuna`,
    `marlin`,
    `swordfish`,
    `angelfish`,
    `clownfish`,
];
// const planets: BasePlanetData[] = [
//   {
//     name: `Cancer`,
//     location: [0, 0],
//     color: `hsl(50, 80%, 60%)`,
//     radius: 56000,
//     factionId,
//     creatures: [`crabs`],
//     repairCostMultiplier: 1,
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: water,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: oxygen,
//           buyMultiplier: 1,
//           sellMultiplier: 0.8,
//         },
//       ],
//       passives: [
//         {
//           passiveData: passiveData.cargoSpace,
//           buyMultiplier: 1.2,
//         },
//       ],
//     },
//   },
//   {
//     name: `Hera`,
//     color: `red`,
//     location: [-1, 0],
//     radius: 26000,
//     creatures: [`lobsters`],
//     repairCostMultiplier: 1.1,
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 1.2,
//           sellMultiplier: 0.8,
//         },
//         {
//           cargoData: water,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.55,
//         },
//         {
//           cargoData: oxygen,
//           buyMultiplier: 1.1,
//           sellMultiplier: 0.9,
//         },
//       ],
//     },
//   },
//   {
//     name: `Osiris`,
//     color: `hsl(240, 80%, 90%)`,
//     location: [0.2, -0.1],
//     radius: 36000,
//     creatures: [`tuna`, `blowfish`],
//     vendor: {
//       cargo: [
//         {
//           cargoData: oxygen,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.4,
//         },
//       ],
//     },
//   },
//   {
//     name: `Neptune`,
//     color: `hsl(240, 80%, 90%)`,
//     location: [-0.15, 0.28],
//     radius: 36000,
//     creatures: [`narwhals`, `beluga whales`],
//     vendor: {
//       cargo: [
//         {
//           cargoData: salt,
//           buyMultiplier: 0.8,
//           sellMultiplier: 0.4,
//         },
//       ],
//     },
//   },
// ]
// export default planets
//# sourceMappingURL=planets.js.map