"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Faction = void 0;
const Stubbable_1 = require("./Stubbable");
class Faction extends Stubbable_1.Stubbable {
    constructor({ name, id, ai, color }, game) {
        super();
        this.type = `faction`;
        this.homeworld = null;
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