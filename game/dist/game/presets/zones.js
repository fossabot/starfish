"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateZoneData = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
function generateZoneData(game) {
    let locationSearchRadius = game.gameSoftRadius * 0.75;
    const tooClose = 0.8;
    let location = [0, 0];
    const isTooClose = (p) => dist_1.default.distance(location, p.location) < tooClose;
    const getClosestPlanet = (closest, p) => dist_1.default.distance(p.location, location) <
        dist_1.default.distance(closest?.location || [0, 0], location)
        ? p
        : closest;
    while (game.planets.find(isTooClose) ||
        game.zones.find(isTooClose) ||
        game.humanShips.find(isTooClose) ||
        dist_1.default.distance(location, [0, 0]) > game.gameSoftRadius) {
        location = dist_1.default.randomInsideCircle(locationSearchRadius);
        locationSearchRadius *= 1.01;
    }
    let radius = (Math.random() + 0.15) * 0.2;
    const color = `hsl(${Math.random() * 360}, ${Math.round(Math.random() * 80 + 20)}%, ${Math.round(Math.random() * 40) + 30}%)`;
    const type = Math.random() > 0.2
        ? `damage over time`
        : `repair over time`;
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
    else {
        name = dist_1.default.randomFromArray(healZoneNames);
        effects.push({
            type: `repair over time`,
            intensity: Math.random() * 0.01,
            procChancePerTick: 1,
        });
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
];
const healZoneNames = [
    `Astral Oasis`,
    `Nanorepair Swarm`,
];
//# sourceMappingURL=zones.js.map