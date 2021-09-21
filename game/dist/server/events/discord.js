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
    socket.on(`ship:create`, async (data, callback) => {
        const ship = __1.game.ships.find((s) => s.id === data.id);
        if (ship) {
            dist_1.default.log(`Call to create existing ship, returning existing.`);
            const stub = dist_1.default.stubify(ship);
            callback({
                data: stub,
            });
        }
        else {
            if (__1.game.humanShips.length >= dist_1.default.gameShipLimit) {
                callback({
                    error: `There are already the maximum number of ships in the game! Please check back later or ask in the support server when more space will be opening up. Priority goes to supporters!`,
                });
                return;
            }
            data.name =
                dist_1.default.sanitize(data.name.substring(0, dist_1.default.maxNameLength))
                    .result || `ship`;
            dist_1.default.log(`Ship ${data.name} has joined the game.`);
            const ship = await __1.game.addHumanShip({
                ...data,
            });
            const stub = dist_1.default.stubify(ship);
            callback({
                data: stub,
            });
        }
    });
    socket.on(`ship:destroy`, (shipId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        __1.game.removeShip(ship);
        callback({ data: `Removed your ship from the game.` });
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
    socket.on(`ship:setCaptain`, (shipId, crewId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        ship.captain = crewMember.id;
        ship.logEntry([
            `${crewMember.name} has been promoted to captain!`,
            `critical`,
        ]);
        callback({ data: `ok` });
    });
    socket.on(`ship:kickMember`, (shipId, crewId, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return callback({ error: `No ship found.` });
        const crewMember = ship.crewMembers.find((cm) => cm.id === crewId);
        if (!crewMember)
            return callback({ error: `No crew member found.` });
        if (ship.captain === crewMember.id)
            ship.captain = null;
        ship.removeCrewMember(crewMember.id);
        callback({ data: `ok` });
    });
    socket.on(`crew:rename`, (shipId, crewId, newName) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return dist_1.default.log(`Attempted to rename a user from a ship that did not exist. (${crewId} on ship ${shipId})`);
        const crewMember = ship.crewMembers?.find((cm) => cm.id === crewId);
        if (!crewMember)
            return dist_1.default.log(`Attempted to rename a user that did not exist. (${crewId} on ship ${shipId})`);
        crewMember.rename(newName);
    });
    socket.on(`ship:rename`, (shipId, newName, callback) => {
        const ship = __1.game.ships.find((s) => s.id === shipId);
        if (!ship)
            return dist_1.default.log(`Attempted to rename a ship that did not exist. (ship ${shipId})`);
        ship.rename(newName);
        callback({ data: ship.name });
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