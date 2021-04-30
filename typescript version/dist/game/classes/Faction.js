"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faction = void 0;
class Faction {
    constructor({ name, color, homeworld, ai }, game) {
        this.name = name;
        this.color = color;
        this.homeworld =
            game.planets.find((p) => p.name === homeworld) || null;
        this.ai = Boolean(ai);
        this.game = game;
    }
    get members() {
        return this.game.ships.filter((s) => s.faction?.color === this.color);
    }
}
exports.Faction = Faction;
//# sourceMappingURL=Faction.js.map