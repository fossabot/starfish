"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`crew:move`, (shipId, crewId, target) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return;
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return;
        crewMember.location = target;
        dist_1.default.log('Set crew member', crewMember.name, 'on ship', ship.name, 'location to', target);
    });
}
exports.default = default_1;
//# sourceMappingURL=crew.js.map