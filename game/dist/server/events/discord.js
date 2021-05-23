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
    // socket.on(
    //   `ship:channelUpdate`,
    //   (guildId, channelType, channelId) => {
    //     const ship = game.ships.find(
    //       (s) => s.human && s.id === guildId,
    //     ) as HumanShip
    //     if (!ship)
    //       return c.log(
    //         `Attempted to set channel ${channelType} of nonexistant ship ${guildId}.`,
    //       )
    //     ship.setChannel(channelType, channelId)
    //     c.log(
    //       `Set channel ${channelType} on ship ${ship.name} to ${channelId}.`,
    //     )
    //   },
    // )
}
exports.default = default_1;
//# sourceMappingURL=discord.js.map