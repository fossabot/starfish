"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackRemnant = void 0;
class AttackRemnant {
    constructor({ attacker, defender, damageTaken, start, end, time, }) {
        this.attacker = attacker;
        this.defender = defender;
        this.damageTaken = damageTaken;
        this.start = start;
        this.end = end;
        this.time = time;
    }
}
exports.AttackRemnant = AttackRemnant;
AttackRemnant.expireTime = 1000 * 60 * 60 * 1;
//# sourceMappingURL=AttackRemnant.js.map