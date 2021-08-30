"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlanet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
function generatePlanet(game, homeworldFactionKey) {
    let name;
    const possibleNames = [...planetNames];
    while (!name && possibleNames.length) {
        const chosenIndex = Math.floor(Math.random() * possibleNames.length);
        let thisName = possibleNames[chosenIndex];
        possibleNames.splice(chosenIndex, 1);
        if (thisName &&
            game.planets.find((p) => p.name == thisName))
            thisName = undefined;
        name = thisName;
    }
    if (!name) {
        const useSuffix = Math.random() > 0.2;
        name = `${!useSuffix
            ? `${dist_1.default.randomFromArray(planetNamePrefixes)} `
            : ``}${dist_1.default.randomFromArray(planetNames)}${useSuffix
            ? ` ${dist_1.default.randomFromArray(planetNameSuffixes)}`
            : ``}`;
        if (game.planets.find((p) => p.name === name))
            name = undefined;
    }
    if (!name)
        return false;
    let locationSearchRadius = game.gameSoftRadius * 0.75;
    const tooClose = 0.2;
    let location = [0, 0];
    const isTooClose = (p) => dist_1.default.distance(location, p.location) <
        tooClose + (p.type === `zone` ? p.radius : 0);
    const getClosestPlanet = (closest, p) => dist_1.default.distance(p.location, location) <
        dist_1.default.distance(closest?.location || [0, 0], location)
        ? p
        : closest;
    while (game.planets.find(isTooClose) ||
        game.humanShips.find(isTooClose) ||
        game.zones.find(isTooClose) ||
        dist_1.default.distance(location, [0, 0]) > game.gameSoftRadius) {
        location = dist_1.default.randomInsideCircle(locationSearchRadius);
        // move planets closer to each other to generate clusters
        const closestPlanet = game.planets.reduce(getClosestPlanet, game.planets[0]);
        if (closestPlanet) {
            const distance = dist_1.default.distance(location, closestPlanet.location);
            if (distance < 1) {
                const vectorTowardsClosestPlanet = dist_1.default.getUnitVectorFromThatBodyToThisBody({ location }, closestPlanet);
                const magnitude = distance * 0.6 * (homeworldFactionKey ? -1 : 1); // spawn homeworlds as "seeds" so they land farther away from other possible homeworlds
                location[0] -=
                    vectorTowardsClosestPlanet[0] * magnitude;
                location[1] -=
                    vectorTowardsClosestPlanet[1] * magnitude;
            }
        }
        locationSearchRadius *= 1.01;
    }
    const radius = Math.floor(Math.random() * 60000 + 10000);
    const mass = ((5.974e30 * radius) / 36000) *
        (1 + 0.2 * (Math.random() - 0.5));
    let factionId;
    if (homeworldFactionKey)
        factionId = homeworldFactionKey;
    else {
        if (Math.random() > 0.6)
            factionId = dist_1.default.randomFromArray(Object.keys(dist_1.default.factions));
        if (factionId === `red`)
            factionId = undefined;
    }
    const color = factionId
        ? dist_1.default.factions[factionId].color
        : `hsl(${Math.random() * 360}, ${Math.round(Math.random() * 80 + 20)}%, ${Math.round(Math.random() * 40) + 30}%)`;
    const level = 0;
    const baseLevel = homeworldFactionKey
        ? 7
        : Math.ceil(Math.random() * 3 +
            dist_1.default.distance(location, [0, 0]) / 3);
    const xp = 0;
    const leanings = [];
    // homeworlds always CAN have cargo
    if (homeworldFactionKey)
        leanings.push({
            type: `cargo`,
            never: false,
            propensity: Math.random() + 0.2,
        });
    while (leanings.length < 3 || Math.random() > 0.6) {
        const leaningType = dist_1.default.randomFromArray([
            `items`,
            `weapon`,
            `armor`,
            `scanner`,
            `communicator`,
            `engine`,
            `chassis`,
            `passives`,
            // , `actives`
            `cargo`,
            `repair`,
        ]);
        if (leanings.find((l) => l.type === leaningType))
            continue;
        const never = dist_1.default.coinFlip();
        leanings.push({
            type: leaningType,
            never,
            propensity: never ? 0 : Math.random(),
        });
    }
    const vendor = {
        cargo: [],
        passives: [],
        actives: [],
        items: [],
        chassis: [],
    };
    // const level = c.distance([0, 0], location)
    // let maxRarity = level
    // const minRarity = level * 0.75
    // const cargoDispropensity = 0.8 - Math.random()
    // const passiveDispropensity = 0.85 - Math.random() * 0.8
    // const itemDispropensity = 1 - Math.random() / 2
    // const chassisDispropensity = 1 - Math.random() / 2
    // // guarantee we have at least ONE thing for sale
    // while (
    //   [
    //     ...vendor.cargo,
    //     ...vendor.items,
    //     ...vendor.passives,
    //   ].filter((v) => v.buyMultiplier).length < 1
    // ) {
    //   for (let d of Object.values(c.cargo)) {
    //     if (d.rarity > maxRarity) continue
    //     if (Math.random() > cargoDispropensity) {
    //       const { buyMultiplier, sellMultiplier } =
    //         getBuyAndSellMultipliers()
    //       vendor.cargo.push({
    //         id: d.id,
    //         buyMultiplier,
    //         sellMultiplier,
    //       })
    //     }
    //   }
    //   for (let d of Object.values(c.crewPassives)) {
    //     if (d.rarity > maxRarity || d.rarity < minRarity)
    //       continue
    //     if (Math.random() > passiveDispropensity) {
    //       const { buyMultiplier, sellMultiplier } =
    //         getBuyAndSellMultipliers()
    //       vendor.passives.push({
    //         id: d.id,
    //         buyMultiplier,
    //       })
    //     }
    //   }
    //   for (let d of [
    //     ...Object.values(c.items.armor),
    //     ...Object.values(c.items.engine),
    //     ...Object.values(c.items.weapon),
    //     ...Object.values(c.items.scanner),
    //     ...Object.values(c.items.communicator),
    //   ].filter((i) => i.buyable !== false && !i.aiOnly)) {
    //     const { buyMultiplier, sellMultiplier } =
    //       getBuyAndSellMultipliers(true)
    //     // vendors will buy any item, but only sell a few
    //     const itemForSale: PlanetVendorItemPrice = {
    //       type: d.type,
    //       id: d.id,
    //       sellMultiplier,
    //     }
    //     if (
    //       d.rarity < maxRarity &&
    //       d.rarity > minRarity &&
    //       Math.random() > itemDispropensity
    //     )
    //       itemForSale.buyMultiplier = buyMultiplier
    //     vendor.items.push(itemForSale)
    //   }
    //   for (let d of Object.values(c.items.chassis)) {
    //     if (d.rarity > maxRarity || d.rarity < minRarity)
    //       continue
    //     if (Math.random() > chassisDispropensity) {
    //       const { buyMultiplier, sellMultiplier } =
    //         getBuyAndSellMultipliers()
    //       vendor.chassis.push({
    //         id: d.id,
    //         buyMultiplier,
    //         sellMultiplier,
    //       })
    //     }
    //   }
    // maxRarity += 0.2
    // }
    // c.log(
    //   vendor.cargo.filter((v) => v.buyMultiplier).length,
    //   vendor.items.filter((v) => v.buyMultiplier).length,
    //   vendor.passives.filter((v) => v.buyMultiplier).length,
    // )
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
        mass,
        factionId,
        homeworld: homeworldFactionKey
            ? { id: homeworldFactionKey }
            : undefined,
        radius,
        location,
        vendor,
        level,
        baseLevel,
        xp,
        leanings,
    };
}
exports.generatePlanet = generatePlanet;
function getBuyAndSellMultipliers(item = false) {
    const buyMultiplier = dist_1.default.r2(0.8 + Math.random() * 0.4, 3);
    const sellMultiplier = Math.min(buyMultiplier *
        dist_1.default.factionVendorMultiplier *
        dist_1.default.factionVendorMultiplier, dist_1.default.r2(buyMultiplier * (Math.random() * 0.2) + 0.8, 3)) * (item ? 0.4 : 1);
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
    `Cualla`,
    `Vakury`,
    `Cioros`,
    `Ibitas`,
    `Deland`,
    `Kenara`,
    `Daeko`,
    `Artan`,
    `Ceti`,
    `Talaran`,
    `Deepsea`,
    `Mist`,
    `Mire`,
    `Wave`,
    `Aran`,
    `Woaka`,
    `Shalos`,
    `Prime`,
    `Hon‘an`,
    `Maztes`,
    `Meron`,
    `Bevis`,
    `Sotara`,
    `Tza`,
    `Uromi`,
    `Oblas`,
    `Wunan`,
    `S'vas`,
    `Loth`,
    `Mora`,
    `Tavda`,
    `Kepes`,
    `Boon`,
    `Oxtus`,
    `Cortus`,
    `Ca‘us`,
    `Sonor`,
    `Ae'o`,
    `K'arth`,
    `Pluthra`,
    `Sotix`,
    `Taleos`,
    `Cynia`,
    `Konar`,
    `C’lax`,
    `Arcton`,
    `Arara`,
    `Ruza`,
    `Tesa`,
    `Onatov`,
    `Eneon`,
    `Hazuno`,
    `Drilia`,
    `Rurn`,
    `Iris`,
    `Zexa`,
    `Nocilia`,
    `Mauti`,
    `Scorpii`,
    `Vorcia`,
    `Cheme`,
    `Dorni`,
    `Alorn`,
    `Endiku`,
    `Upyr`,
    `Europa`,
    `Olympus`,
    `Irra`,
    `Ungol`,
];
const planetNamePrefixes = [`New`];
const planetNameSuffixes = [
    `Prime`,
    `II`,
    `IV`,
    `Beta`,
    `VI`,
    `III`,
    `Landing`,
    `V`,
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
    { name: `narwhals`, factionKey: `blue` },
    { name: `dolphins`, factionKey: `blue` },
    { name: `sea otters`, factionKey: `blue` },
    { name: `sea turtles`, factionKey: `blue` },
    { name: `sea lions`, factionKey: `blue` },
];
// { name: `penguins`, factionKey: `blue` },
// { name: `seagulls`, factionKey: `blue` },
// { name: `pelicans`, factionKey: `blue` },
//# sourceMappingURL=planets.js.map