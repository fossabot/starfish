"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackRemnant = void 0;
const Stubbable_1 = require("./Stubbable");
class AttackRemnant extends Stubbable_1.Stubbable {
    constructor({ attacker, defender, damageTaken, start, end, time, id, onlyVisibleToShipId, }) {
        super();
        this.type = `attackRemnant`;
        this.id = id || `${Math.random()}`.substring(2);
        this.attacker = attacker;
        this.defender = defender;
        this.damageTaken = damageTaken;
        this.start = start;
        this.end = end;
        this.time = time;
        this.onlyVisibleToShipId = onlyVisibleToShipId;
    }
    stubify(d, a) {
        return {
            attacker: this.attacker.toReference
                ? this.attacker.toReference()
                : this.attacker,
            defender: this.defender.toReference
                ? this.defender.toReference()
                : this.defender,
            damageTaken: this.damageTaken,
            start: this.start,
            end: this.end,
            time: this.time,
            id: this.id,
        };
    }
}
exports.AttackRemnant = AttackRemnant;
//# sourceMappingURL=AttackRemnant.js.map