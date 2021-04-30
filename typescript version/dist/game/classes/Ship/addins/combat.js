"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeDamage = exports.attack = void 0;
const common_1 = __importDefault(require("../../../../common"));
function attack(target, weapon) {
    common_1.default.log(`Attacking`);
    return {
        damage: 1,
        weapon: weapon,
    };
}
exports.attack = attack;
function takeDamage(attacker, damage) {
    common_1.default.log(`Taking ${damage.damage} damage from ${attacker.name}'s ${damage.weapon.displayName}`);
    this.hp -= damage.damage;
    const didDie = this.hp <= 0;
    return {
        damageTaken: damage.damage,
        didDie: didDie,
    };
}
exports.takeDamage = takeDamage;
//# sourceMappingURL=combat.js.map