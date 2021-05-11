"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const io_1 = require("../io");
const HumanShip_1 = require("../../game/classes/Ship/HumanShip");
function default_1(socket) {
    socket.on(`ships:forUser:fromIdArray`, (shipIds, userId, callback) => {
        const foundShips = __1.game.ships.filter((s) => s instanceof HumanShip_1.HumanShip &&
            shipIds.includes(s.id) &&
            s.crewMembers.find((cm) => cm.id === userId));
        if (foundShips.length) {
            const shipsAsStubs = foundShips.map((s) => io_1.stubify(s));
            callback({
                data: shipsAsStubs,
            });
        }
        else
            callback({ error: `No ships found by those IDs.` });
    });
    socket.on(`ship:get`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = io_1.stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
}
exports.default = default_1;
//# sourceMappingURL=general.js.map