"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`hello`, () => {
        dist_1.default.log(`hello received`);
    });
    socket.on(`ships:forUser:fromIdArray`, (shipIds, userId, callback) => {
        // c.log(`ships:forUser:fromIdArray`, shipIds, userId)
        const foundShips = __1.game.ships.filter((s) => s.human &&
            shipIds.includes(s.id) &&
            s.crewMembers.find((cm) => cm.id === userId));
        if (foundShips.length) {
            const shipsAsStubs = foundShips.map((s) => dist_1.default.stubify(s));
            callback({
                data: shipsAsStubs,
            });
        }
        else
            callback({ data: [] });
    });
    socket.on(`ship:get`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = dist_1.default.stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else
            callback({ error: `No ship found by the ID ${id}.` });
    });
}
exports.default = default_1;
//# sourceMappingURL=general.js.map