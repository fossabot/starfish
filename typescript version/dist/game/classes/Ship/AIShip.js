"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIShip = void 0;
const CombatShip_1 = require("./CombatShip");
class AIShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.obeysGravity = false;
        this.human = false;
        if (data.id)
            this.id = data.id;
        else
            this.id = `${Math.random()}`.substring(2);
        this.faction =
            game.factions.find((f) => f.ai === true) || null;
    }
    tick() {
        super.tick();
        // attack human in range
    }
}
exports.AIShip = AIShip;
//# sourceMappingURL=AIShip.js.map