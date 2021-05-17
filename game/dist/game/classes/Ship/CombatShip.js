"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatShip = void 0;
const Ship_1 = require("./Ship");
const combat_1 = require("./addins/combat");
class CombatShip extends Ship_1.Ship {
    constructor() {
        super(...arguments);
        this.attackable = true;
        this.attack = combat_1.attack;
        this.takeDamage = combat_1.takeDamage;
        this.canAttack = combat_1.canAttack;
    }
    attackRange() {
        return this.weapons.reduce((highest, curr) => Math.max(curr.range, highest), 0);
    }
    availableWeapons() {
        const now = Date.now();
        return this.weapons.filter((w) => now - w.lastUse > w.baseCooldown);
    }
    enemiesInAttackRange() {
        const allShipsInRange = this.game.scanCircle(this.location, this.attackRange(), this.id, `ship`).ships;
        const combatShipsInRange = allShipsInRange.filter((s) => s instanceof CombatShip);
        return combatShipsInRange.filter((s) => this.canAttack(s));
    }
}
exports.CombatShip = CombatShip;
//# sourceMappingURL=CombatShip.js.map