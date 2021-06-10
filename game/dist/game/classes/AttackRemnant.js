"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackRemnant = void 0;
const Stubbable_1 = require("./Stubbable");
class AttackRemnant extends Stubbable_1.Stubbable {
    constructor({ attacker, defender, damageTaken, start, end, time, id, }) {
        super();
        this.id = id || `${Math.random()}`.substring(2);
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