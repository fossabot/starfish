"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../..");
const io_1 = require("../io");
function default_1(socket) {
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