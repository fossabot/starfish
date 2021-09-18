"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faction = void 0;
class Faction {
    type = `faction`;
    name;
    id;
    color;
    homeworld = null;
    ai;
    game;
    constructor({ name, id, ai, color }, game) {
        this.name = name;
        this.id = id;
        this.ai = Boolean(ai);
        this.color = color;
        this.game = game;
    }
    get members() {
        return this.game.ships.filter((s) => s.faction && s.faction.id === this.id);
    }
}
exports.Faction = Faction;
//# sourceMappingURL=Faction.js.map