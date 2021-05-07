"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../common/dist"));
const __1 = require("..");
const io_1 = require("./io");
// (socket: Socket<IOClientEvents, IOServerEvents>) => {
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
    socket.on('ship:targetLocation', (id, targetLocation) => {
        if (!Array.isArray(targetLocation) ||
            targetLocation.length !== 2 ||
            targetLocation.find((l) => isNaN(parseInt(l))))
            return dist_1.default.log('Invalid call to set targetLocation:', id, targetLocation);
        const foundShip = __1.game.ships.find((s) => s.id === id);
        if (foundShip)
            foundShip.targetLocation = targetLocation;
    });
    // socket.on(`ship:get`, (id, callback) => {
    //   const foundShip = game.ships.find((s) => s.id === id)
    //   if (foundShip) {
    //     const stub = stubify<Ship, ShipStub>(foundShip)
    //     callback({
    //       data: stub,
    //     })
    //   } else
    //     callback({ error: `No ship found by that ID.` })
    // })
}
exports.default = default_1;
//# sourceMappingURL=frontendEvents.js.map