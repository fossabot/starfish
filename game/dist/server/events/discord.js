"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`discord`, () => {
        dist_1.default.log(`Discord process connected to io`);
        socket.join([`discord`]);
    });
    socket.on(`ship:create`, (data, callback) => {
        const ship = __1.game.ships.find((s) => s.id === data.id);
        if (ship) {
            dist_1.default.log(`Call to create existing ship, returning existing.`);
            const stub = dist_1.default.stubify(ship);
            callback({
                data: stub,
            });
        }
        else {
            data.name = data.name.substring(0, dist_1.default.maxNameLength);
            const ship = __1.game.addHumanShip({
                ...data,
            });
            const stub = dist_1.default.stubify(ship);
            callback({
                data: stub,
            });
        }
    });
    socket.on(`ship:broadcast`, (shipId, crewId, message, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        const broadcastRes = ship.broadcast(message, crewMember);
        callback({ data: broadcastRes });
    });
    socket.on(`crew:rename`, (shipId, crewId, newName) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return dist_1.default.log(`Attempted to rename a user from a ship that did not exist. (${crewId} on ship ${shipId})`);
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return dist_1.default.log(`Attempted to rename a user that did not exist. (${crewId} on ship ${shipId})`);
        crewMember.name = dist_1.default
            .sanitize(newName)
            .result.substring(0, dist_1.default.maxNameLength);
    });
    socket.on(`ship:alertLevel`, (shipId, newLevel, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return dist_1.default.log(`Attempted to change alert level of a ship that did not exist. (${shipId})`);
        ship.logAlertLevel = newLevel;
        callback({ data: ship.logAlertLevel });
    });
}
exports.default = default_1;
//# sourceMappingURL=discord.js.map