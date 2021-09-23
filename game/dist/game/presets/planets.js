"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBasicPlanet = exports.generateMiningPlanet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
function getName(game) {
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
    if (!name || Math.random() > 0.9) {
        const useSuffix = Math.random() > 0.2;
        name = `${!useSuffix
            ? `${dist_1.default.randomFromArray(planetNamePrefixes)} `
            : ``}${dist_1.default.randomFromArray(planetNames)}${useSuffix
            ? `${dist_1.default.randomFromArray(planetNameSuffixes)}`
            : ``}`;
        if (game.planets.find((p) => p.name === name))
            name = undefined;
    }
    return name;
}
function getLocation(game, isHomeworld) {
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
                const magnitude = distance * 0.6 * (isHomeworld ? -1 : 1); // spawn homeworlds as "seeds" so they land farther away from other possible homeworlds
                location[0] -=
                    vectorTowardsClosestPlanet[0] * magnitude;
                location[1] -=
                    vectorTowardsClosestPlanet[1] * magnitude;
            }
        }
        locationSearchRadius *= 1.01;
    }
    return location;
}
function generateMiningPlanet(game) {
    const name = getName(game);
    if (!name)
        return false;
    const location = getLocation(game);
    const level = 0;
    const baseLevel = 1;
    const xp = 0;
    const color = `hsl(${Math.round(Math.random() * 360)}, ${Math.round(Math.random() * 40)}%, ${Math.round(Math.random() * 50) + 30}%)`;
    const radius = Math.floor(Math.random() * 60000 + 10000);
    const mass = ((4e30 * radius) / 36000) *
        (1 + 0.2 * (Math.random() - 0.5));
    const creatures = [];
    while (Math.random() > 0.7) {
        const viableCreatures = [
            ...seaCreatures,
            ...landCreatures,
        ];
        const chosen = dist_1.default.randomFromArray(viableCreatures);
        if (!creatures.find((cre) => cre === chosen.name))
            creatures.push(chosen.name);
    }
    return {
        planetType: `mining`,
        pacifist: false,
        name,
        location,
        color,
        level,
        baseLevel,
        xp,
        creatures,
        radius,
        mass,
        landingRadiusMultiplier: 1,
    };
}
exports.generateMiningPlanet = generateMiningPlanet;
function generateBasicPlanet(game, homeworldFactionKey) {
    const planetType = `basic`;
    const name = getName(game);
    if (!name)
        return false;
    const location = getLocation(game, homeworldFactionKey);
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
    let color;
    if (factionId)
        color = dist_1.default.factions[factionId].color;
    else {
        let hue = Math.random() * 360;
        // don't let color be too close to a faction color
        while (Object.values(dist_1.default.factions).find((f) => {
            let factionHue = /hsl\(([^,]*),.*/g.exec(f.color)?.[1], potentialHue = hue;
            try {
                factionHue = parseInt(`${factionHue}`);
            }
            catch (e) {
                return false;
            }
            if (isNaN(factionHue)) {
                dist_1.default.log(`Failed to get faction hue from`, f.color);
                return false;
            }
            if (factionHue > 180)
                factionHue -= 360;
            if (potentialHue > 180)
                potentialHue -= 360;
            if (Math.abs(factionHue - potentialHue) < 25)
                return true;
            return false;
        })) {
            hue = Math.random() * 360;
        }
        color = `hsl(${Math.round(hue)}, ${Math.round(Math.random() * 80 + 20)}%, ${Math.round(Math.random() * 40) + 40}%)`;
    }
    const level = 0;
    const baseLevel = homeworldFactionKey
        ? dist_1.default.defaultHomeworldLevel
        : Math.ceil(Math.random() * 5 +
            dist_1.default.distance(location, [0, 0]) / 3);
    const xp = 0;
    const leanings = [];
    // homeworlds always CAN have cargo, and lean slightly that way
    if (homeworldFactionKey)
        leanings.push({
            type: `cargo`,
            never: false,
            propensity: Math.random() * 2 + 1,
        });
    while (leanings.length < 4 || Math.random() > 0.4) {
        const leaningTypes = [
            `items`,
            `weapon`,
            `armor`,
            `scanner`,
            `communicator`,
            `engine`,
            `chassis`,
            `shipPassives`,
            `crewPassives`,
            // , `actives`
            `cargo`,
            `repair`,
        ];
        const leaningType = dist_1.default.randomFromArray(leaningTypes);
        if (leanings.find((l) => l.type === leaningType))
            continue;
        const never = dist_1.default.coinFlip();
        leanings.push({
            type: leaningType,
            never,
            propensity: never ? 0 : Math.random() * 2,
        });
    }
    // if (homeworldFactionKey) c.log(leanings)
    const vendor = {
        cargo: [],
        passives: [],
        actives: [],
        items: [],
        chassis: [],
    };
    const creatures = [];
    while (creatures.length === 0 || Math.random() > 0.5) {
        const viableCreatures = factionId
            ? seaCreatures.filter((s) => s.factionKey === factionId)
            : seaCreatures;
        const chosen = dist_1.default.randomFromArray(viableCreatures);
        if (!creatures.find((cre) => cre === chosen.name))
            creatures.push(chosen.name);
    }
    const pacifist = homeworldFactionKey
        ? true
        : Math.random() > 0.2;
    return {
        planetType,
        name,
        color,
        creatures,
        mass,
        landingRadiusMultiplier: 1,
        repairFactor: 0,
        allegiances: [],
        pacifist,
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
exports.generateBasicPlanet = generateBasicPlanet;
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
    // todo MORE
];
const planetNamePrefixes = [`New`, `Old`];
const planetNameSuffixes = [
    ` Prime`,
    ` II`,
    ` IV`,
    ` Beta`,
    ` VI`,
    ` III`,
    `'s Landing`,
    ` V`,
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
const landCreatures = [
    { name: `penguins` },
    { name: `seagulls` },
    { name: `pelicans` },
    { name: `parrots` },
    { name: `pigeons` },
    { name: `crows` },
    { name: `owls` },
    { name: `hawks` },
    { name: `ravens` },
    { name: `eagles` },
    { name: `falcons` },
    { name: `wolves` },
    { name: `foxes` },
    { name: `coyotes` },
    { name: `raccoons` },
    { name: `bears` },
    { name: `lions` },
    { name: `tigers` },
    { name: `brown bears` },
    { name: `black bears` },
    { name: `buffalos` },
    { name: `ants` },
    { name: `bees` },
    { name: `butterflies` },
    { name: `crickets` },
    { name: `caterpillars` },
    { name: `cicadas` },
    { name: `cockroaches` },
    { name: `spiders` },
    { name: `grasshoppers` },
    { name: `moths` },
    { name: `mice` },
    { name: `snakes` },
    { name: `snails` },
    { name: `slugs` },
    { name: `toads` },
    { name: `turtles` },
    { name: `pigs` },
    { name: `sheep` },
    { name: `chickens` },
    { name: `goats` },
    { name: `cows` },
    { name: `horses` },
    { name: `donkeys` },
    { name: `ponies` },
    { name: `rabbits` },
];
//# sourceMappingURL=planets.js.map