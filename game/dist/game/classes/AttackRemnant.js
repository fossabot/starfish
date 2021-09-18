"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttackRemnant = void 0;
const Stubbable_1 = require("./Stubbable");
class AttackRemnant extends Stubbable_1.Stubbable {
    id;
    attacker;
    defender;
    damageTaken;
    start;
    end;
    time;
    onlyVisibleToShipId;
    // todo are these being stubified correctly? pre-db-save-and-load, that is
    constructor({ attacker, defender, damageTaken, start, end, time, id, onlyVisibleToShipId, }) {
        super();
        this.id = id || `${Math.random()}`.substring(2);
        this.attacker = attacker;
        this.defender = defender;
        this.damageTaken = damageTaken;
        this.start = start;
        this.end = end;
        this.time = time;
        this.onlyVisibleToShipId = onlyVisibleToShipId;
    }
}
exports.AttackRemnant = AttackRemnant;
//# sourceMappingURL=AttackRemnant.js.map