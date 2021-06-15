"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Species = void 0;
class Species {
    constructor({ id, factionId, icon, singular }, game) {
        this.id = id;
        this.icon = icon;
        this.singular = singular;
        this.game = game;
        this.faction = game.factions.find((f) => f.id === factionId);
    }
    get members() {
        return this.game.ships.filter((s) => s.species === this);
    }
}
exports.Species = Species;
//# sourceMappingURL=Species.js.map