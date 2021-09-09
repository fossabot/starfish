"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZoneData = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
function generateZoneData(game) {
    let radius = (Math.random() + 0.15) * 0.2;
    let locationSearchRadius = game.gameSoftRadius * 0.75;
    const tooClose = radius * 3;
    let location = [0, 0];
    const isTooClose = (p) => dist_1.default.distance(location, p.location) < tooClose;
    // const getClosestPlanet = (closest: Planet, p: Planet) =>
    //   c.distance(p.location, location) <
    //   c.distance(closest?.location || [0, 0], location)
    //     ? p
    //     : closest
    while (game.planets.find(isTooClose) ||
        game.zones.find(isTooClose) ||
        game.humanShips.find(isTooClose)) {
        location = dist_1.default.randomInsideCircle(locationSearchRadius);
        locationSearchRadius *= 1.01;
    }
    const color = `hsl(${Math.random() * 360}, ${Math.round(Math.random() * 80 + 20)}%, ${Math.round(Math.random() * 40) + 45}%)`;
    const weightedTypes = [
        { value: `accelerate`, weight: 2 },
        { value: `decelerate`, weight: 2 },
        { value: `damage over time`, weight: 5 },
        { value: `repair over time`, weight: 1 },
        { value: `wormhole`, weight: 0.5 },
    ];
    const type = dist_1.default.randomWithWeights(weightedTypes) || `damage over time`;
    let name;
    const effects = [];
    if (type === `damage over time`) {
        name = dist_1.default.randomFromArray(dotZoneNames);
        effects.push({
            type: `damage over time`,
            intensity: Math.min(1, Math.random() + 0.03),
            procChancePerTick: Math.random() * 0.001,
            dodgeable: true,
        });
        radius *= 2.5;
    }
    else if (type === `repair over time`) {
        name = dist_1.default.randomFromArray(healZoneNames);
        effects.push({
            type: `repair over time`,
            intensity: Math.min(1, Math.random() + 0.03),
            procChancePerTick: 1,
        });
    }
    else if (type === `accelerate`) {
        name = dist_1.default.randomFromArray(accelerateZoneNames);
        effects.push({
            type: `accelerate`,
            intensity: Math.min(1, Math.random() + 0.03),
            procChancePerTick: 1,
            basedOnProximity: dist_1.default.coinFlip(),
        });
        radius *= 1.1;
    }
    else if (type === `decelerate`) {
        name = dist_1.default.randomFromArray(decelerateZoneNames);
        effects.push({
            type: `decelerate`,
            intensity: Math.min(1, Math.random() + 0.03),
            procChancePerTick: 1,
            basedOnProximity: dist_1.default.coinFlip(),
        });
        radius *= 1.2;
    }
    else if (type === `wormhole`) {
        name = dist_1.default.randomFromArray(wormholeZoneNames);
        effects.push({
            type: `wormhole`,
            intensity: 1,
            procChancePerTick: 1,
        });
        radius *= 0.1;
    }
    if (!name)
        return false;
    return {
        id: `zone${`${Math.random()}`.substring(2)}`,
        name,
        color,
        radius,
        location,
        effects,
    };
}
exports.generateZoneData = generateZoneData;
// todo more names
const dotZoneNames = [
    `Ripping Field`,
    `Asteroid Field`,
    `Asteroid Belt`,
    `Debris Field`,
    `Radiation Zone`,
    `Minefield`,
    `Shredder Swarm`,
    `Gamma Cloud`,
    `Planetary Remains`,
    `Toxic Waste`,
];
const healZoneNames = [
    `Astral Oasis`,
    `Nanorepair Swarm`,
    `Calming Flux`,
    `Healing Field`,
];
const accelerateZoneNames = [
    `Gravity Slingshot`,
    `Overcharge Field`,
    `Gravitational Anomaly`,
    `Boost Zone`,
    `Acceleration Field`,
];
const decelerateZoneNames = [
    `Magnesis Field`,
    `Gravity Well`,
    `Murky Nebula`,
    `Stifling Zone`,
    `Deceleration Zone`,
];
const wormholeZoneNames = [
    `Wormhole`,
    `Universe Flux Point`,
    `Gravitational Rift`,
];
//# sourceMappingURL=zones.js.map