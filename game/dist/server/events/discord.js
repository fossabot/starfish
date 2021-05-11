"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const __1 = require("../..");
const io_1 = require("../io");
function default_1(socket) {
    socket.on('discord', () => {
        dist_1.default.log(`Discord process connected to io`);
        socket.join([`discord`]);
    });
    socket.on(`ship:create`, (data, callback) => {
        const foundShip = __1.game.ships.find((s) => s.id === data.id);
        if (foundShip) {
            dist_1.default.log(`Call to create existing ship, returning existing`);
            const stub = io_1.stubify(foundShip);
            callback({
                data: stub,
            });
        }
        else {
            const ship = __1.game.addHumanShip(data);
            const stub = io_1.stubify(ship);
            callback({
                data: stub,
            });
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=discord.js.map