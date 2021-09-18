"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Species = void 0;
class Species {
    type = `species`;
    id;
    icon;
    singular;
    game;
    passives = [];
    description;
    faction;
    constructor({ id, factionId, icon, singular, description, passives, }, game) {
        this.id = id;
        this.icon = icon;
        this.singular = singular;
        this.game = game;
        this.faction = game.factions.find((f) => f.id === factionId);
        this.description = description;
        if (passives)
            this.passives = passives;
    }
    get members() {
        return this.game.ships.filter((s) => s.species === this);
    }
}
exports.Species = Species;
//# sourceMappingURL=Species.js.map