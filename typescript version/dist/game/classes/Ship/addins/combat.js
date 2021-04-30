"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeDamage = exports.attack = exports.canAttack = void 0;
const common_1 = __importDefault(require("../../../../common"));
function canAttack(otherShip) {
    if (!otherShip?.attackable)
        return false;
    if (otherShip.faction &&
        otherShip.faction.color === this.faction?.color)
        return false;
    if (common_1.default.distance(otherShip.location, this.location) >
        this.attackRange)
        return false;
    if (!this.availableWeapons.length)
        return false;
    return true;
}
exports.canAttack = canAttack;
function attack(target, weapon) {
    if (!this.canAttack(target))
        return { damageTaken: 0, didDie: false, weapon };
    weapon.lastUse = Date.now();
    const damageResult = {
        damage: 1,
        weapon,
    };
    const attackResult = target.takeDamage(this, damageResult);
    return attackResult;
}
exports.attack = attack;
function takeDamage(attacker, damage) {
    const previousHp = this.hp;
    this.hp -= damage.damage;
    const didDie = previousHp > 0 && this.hp <= 0;
    if (didDie)
        this.dead = true;
    common_1.default.log(`${this.name} takes ${damage.damage} damage from ${attacker.name}'s ${damage.weapon.displayName}, and ${didDie ? `died` : `has ${this.hp} hp left`}.`);
    return {
        damageTaken: damage.damage,
        didDie: didDie,
        weapon: damage.weapon,
    };
}
exports.takeDamage = takeDamage;
//# sourceMappingURL=combat.js.map