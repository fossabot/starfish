"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const CombatShip_1 = require("./CombatShip");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.human = true;
        this.id = data.id;
        //* id matches discord guildId here
    }
}
exports.HumanShip = HumanShip;
//# sourceMappingURL=HumanShip.js.map