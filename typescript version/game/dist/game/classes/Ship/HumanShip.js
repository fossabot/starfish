"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CrewMember_1 = require("../CrewMember/CrewMember");
const CombatShip_1 = require("./CombatShip");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.crewMembers = [];
        this.human = true;
        this.id = data.id;
        //* id matches discord guildId here
        data.crewMembers.forEach((cm) => {
            this.crewMembers.push(new CrewMember_1.CrewMember(cm, this));
        });
    }
    tick() {
        super.tick();
        this.crewMembers.forEach((cm) => cm.tick());
    }
    addCrewMember(data) {
        this.crewMembers.push(new CrewMember_1.CrewMember(data, this));
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        if (index === -1) {
            dist_1.default.log('red', 'attempted to remove crew member that did not exist', id, 'from ship', this.id);
            return;
        }
        this.crewMembers.splice(index, 1);
    }
}
exports.HumanShip = HumanShip;
//# sourceMappingURL=HumanShip.js.map