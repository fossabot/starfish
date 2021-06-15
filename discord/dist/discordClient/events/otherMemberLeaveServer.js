"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
async function default_1(guildMember) {
    const ship = await ioInterface_1.default.ship.get(guildMember.guild.id);
    if (!ship)
        return;
    const crewMember = ship.crewMembers?.find((cm) => cm.id === guildMember.id);
    if (!crewMember)
        return;
    dist_1.default.log(`red`, `Member ${guildMember.nickname ||
        guildMember.user?.username ||
        `(unknown name)`} has left guild ${guildMember.guild.name}, kicking from ship...`);
    ioInterface_1.default.ship.kickMember(ship.id, crewMember.id);
}
exports.default = default_1;
//# sourceMappingURL=otherMemberLeaveServer.js.map