"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatShip = void 0;
const Ship_1 = require("./Ship");
const combat_1 = require("./addins/combat");
class CombatShip extends Ship_1.Ship {
    constructor() {
        super(...arguments);
        this.attackable = true;
        this.hp = 10;
        this.attack = combat_1.attack;
        this.takeDamage = combat_1.takeDamage;
        this.canAttack = combat_1.canAttack;
        this.die = combat_1.die;
    }
    get attackRange() {
        return this.weapons.reduce((highest, curr) => Math.max(curr.range, highest), 0);
    }
    get availableWeapons() {
        const now = Date.now();
        return this.weapons.filter((w) => now - w.lastUse > w.cooldownInMs);
    }
    get enemiesInAttackRange() {
        const allShipsInRange = this.game.scanCircle(this.location, this.attackRange, `ship`).ships;
        const combatShipsInRange = allShipsInRange.filter((s) => s instanceof CombatShip);
        return combatShipsInRange.filter((s) => this.canAttack(s));
    }
    get alive() {
        return this.hp >= 0;
    }
}
exports.CombatShip = CombatShip;
//# sourceMappingURL=CombatShip.js.map