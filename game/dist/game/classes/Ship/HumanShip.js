"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanShip = void 0;
const dist_1 = __importDefault(require("../../../../../common/dist"));
const CrewMember_1 = require("../CrewMember/CrewMember");
const CombatShip_1 = require("./CombatShip");
const crew_1 = require("./addins/crew");
const io_1 = require("../../../server/io");
class HumanShip extends CombatShip_1.CombatShip {
    constructor(data, game) {
        super(data, game);
        this.crewMembers = [];
        this.captain = null;
        this.availableRooms = [
            `bunk`,
            `cockpit`,
            `repair`,
            `weapons`,
        ];
        this.membersIn = crew_1.membersIn;
        this.cumulativeSkillIn = crew_1.cumulativeSkillIn;
        this.human = true;
        this.id = data.id;
        //* id matches discord guildId here
        this.captain = data.captain || null;
        data.crewMembers?.forEach((cm) => {
            this.addCrewMember(cm);
        });
    }
    tick() {
        this.crewMembers.forEach((cm) => cm.tick());
        this.toUpdate.crewMembers = this.crewMembers.map((cm) => io_1.stubify(cm));
        super.tick();
    }
    addRoom(room) {
        if (!this.availableRooms.includes(room))
            this.availableRooms.push(room);
    }
    removeRoom(room) {
        const index = this.availableRooms.findIndex((r) => r === room);
        if (index !== -1)
            this.availableRooms.splice(index, 1);
    }
    addCrewMember(data) {
        const cm = new CrewMember_1.CrewMember(data, this);
        this.crewMembers.push(cm);
        if (!this.captain)
            this.captain = cm.id;
        dist_1.default.log(`Added crew member`, cm.name, `to`, this.name);
        return cm;
    }
    removeCrewMember(id) {
        const index = this.crewMembers.findIndex((cm) => cm.id === id);
        if (index === -1) {
            dist_1.default.log(`red`, `Attempted to remove crew member that did not exist`, id, `from ship`, this.id);
            return;
        }
        this.crewMembers.splice(index, 1);
    }
    respawn() {
        super.respawn();
        this.crewMembers.forEach((cm) => {
            cm.inventory = [];
            cm.credits *= 0.5;
        });
    }
}
exports.HumanShip = HumanShip;
//# sourceMappingURL=HumanShip.js.map