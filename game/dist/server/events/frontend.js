"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
const io_1 = require("../io");
function default_1(socket) {
    socket.on('god', () => {
        socket.join(['game']);
    });
    socket.on('ship:listen', (id, callback) => {
        dist_1.default.log(`Frontend client started watching ship ${id} io`);
        socket.join([`ship:${id}`]);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip) {
            const stub = io_1.stubify(foundShip);
            callback({ data: stub });
        }
        else
            callback({ error: `No ship found by that ID.` });
    });
    socket.on('ship:unlisten', (id) => {
        dist_1.default.log('gray', `Frontend client stopped watching ${id} io`);
        socket.leave(`ship:${id}`);
    });
}
exports.default = default_1;
//# sourceMappingURL=frontend.js.map