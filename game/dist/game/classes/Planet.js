"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planet = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class Planet {
    constructor({ name, color, location, vendor, faction, races, repairCostMultiplier, radius, }, game) {
        this.game = game;
        this.name = name;
        this.color = color;
        this.location = location;
        this.radius = radius;
        this.vendor = vendor || null;
        this.faction =
            (faction
                ? this.game.factions.find((f) => f.color === faction.color)
                : null) || null;
        this.races = races || [];
        this.repairCostMultiplier = repairCostMultiplier || 0;
    }
    identify() {
        dist_1.default.log(`Planet: ${this.name} (${this.color}) at ${this.location}`);
    }
    shipsAt() {
        return this.game.humanShips.filter((s) => s.planet === this);
    }
}
exports.Planet = Planet;
//# sourceMappingURL=Planet.js.map