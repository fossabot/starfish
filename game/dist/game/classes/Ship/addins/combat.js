"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeDamage = exports.attack = exports.canAttack = void 0;
const dist_1 = __importDefault(require("../../../../../../common/dist"));
const io_1 = require("../../../../server/io");
function canAttack(otherShip) {
    if (otherShip.planet || this.planet)
        return false;
    if (otherShip.dead || this.dead)
        return false;
    if (!otherShip?.attackable)
        return false;
    if (otherShip.faction &&
        this.faction &&
        otherShip.faction.color === this.faction.color)
        return false;
    if (dist_1.default.distance(otherShip.location, this.location) >
        this.attackRange())
        return false;
    if (!this.availableWeapons().length)
        return false;
    return true;
}
exports.canAttack = canAttack;
function attack(target, weapon) {
    if (!this.canAttack(target))
        return { damageTaken: 0, didDie: false, weapon };
    weapon.use();
    const totalMunitionsSkill = this.cumulativeSkillIn(`weapons`, `munitions`);
    const range = dist_1.default.distance(this.location, target.location);
    const rangeAsPercent = range / weapon.range;
    const miss = Math.random() > rangeAsPercent;
    const damage = miss
        ? 0
        : weapon.damage * totalMunitionsSkill;
    const damageResult = {
        miss,
        damage,
        weapon,
    };
    const attackResult = target.takeDamage(this, damageResult);
    this.game.addAttackRemnant({
        attacker: this,
        defender: target,
        damageTaken: attackResult,
        start: [...this.location],
        end: [...target.location],
        time: Date.now(),
    });
    return attackResult;
}
exports.attack = attack;
function takeDamage(attacker, damage) {
    const previousHp = this.hp;
    this.hp -= damage.damage;
    const didDie = previousHp > 0 && this.hp <= 0;
    dist_1.default.log(`${this.name} takes ${damage.damage} damage from ${attacker.name}'s ${damage.weapon.displayName}, and ${didDie ? `dies` : `has ${this.hp} hp left`}.`);
    // ----- notify listeners -----
    io_1.io.to(`ship:${this.id}`).emit(`ship:update`, {
        id: this.id,
        updates: { dead: this.dead, _hp: this._hp },
    });
    return {
        damageTaken: damage.damage,
        didDie: didDie,
        weapon: damage.weapon,
    };
}
exports.takeDamage = takeDamage;
//# sourceMappingURL=combat.js.map