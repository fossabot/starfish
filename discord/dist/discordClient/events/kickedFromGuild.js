"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = __importDefault(require("../../../../common/dist"));
const ioInterface_1 = __importDefault(require("../../ioInterface"));
async function default_1(guild) {
    dist_1.default.log(`red`, `Guild ${guild.name} has kicked the bot.`);
    const ship = await ioInterface_1.default.ship.get(guild.id);
    if (ship)
        await ioInterface_1.default.ship.destroy(guild.id);
}
exports.default = default_1;
//# sourceMappingURL=kickedFromGuild.js.map