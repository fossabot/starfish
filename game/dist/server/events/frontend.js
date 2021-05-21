"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
function default_1(socket) {
    socket.on(`god`, () => {
        socket.join([`game`]);
    });
    socket.on(`ship:listen`, (id, callback) => {
        dist_1.default.log(`gray`, `Frontend client started watching ship ${id} io`);
        socket.join([`ship:${id}`]);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = dist_1.default.stubify(foundShip);
            callback({ data: stub });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on(`ship:unlisten`, (id) => {
        dist_1.default.log(`gray`, `Frontend client stopped watching ${id} io`);
        socket.leave(`ship:${id}`);
    });
    socket.on(`ship:respawn`, (id, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (!foundShip) {
            callback({ error: `That ship doesn't exist yet!` });
            return;
        }
        if (!foundShip.dead) {
            callback({ error: `That ship isn't dead!` });
            return;
        }
        foundShip.respawn();
        const stub = dist_1.default.stubify(foundShip);
        callback({
            data: stub,
        });
    });
}
exports.default = default_1;
//# sourceMappingURL=frontend.js.map