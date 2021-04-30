"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatShip = void 0;
const Ship_1 = require("./Ship");
const combat_1 = require("./addins/combat");
class CombatShip extends Ship_1.Ship {
    constructor() {
        super(...arguments);
        this.hp = 10;
        this.attack = combat_1.attack;
        this.takeDamage = combat_1.takeDamage;
    }
}
exports.CombatShip = CombatShip;
//# sourceMappingURL=CombatShip.js.map