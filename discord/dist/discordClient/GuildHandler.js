"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildHandler = void 0;
const _1 = require(".");
const ioInterface_1 = __importDefault(require("../ioInterface"));
const GameGuild_1 = require("./models/GameGuild");
class GuildHandler {
    constructor() {
        this.gameGuilds = {};
    }
    start() {
        _1.client.guilds.cache.array().forEach(async (guild) => {
            this.add(guild);
        });
    }
    async add(guild) {
        if (this.gameGuilds[guild.id])
            return this.gameGuilds[guild.id];
        const shipData = await ioInterface_1.default.ship.get(guild.id);
        const newGameGuild = new GameGuild_1.GameGuild({
            guild,
            channelReferences: shipData?.channelReferences || [],
        });
        this.gameGuilds[guild.id] = newGameGuild;
        return newGameGuild;
    }
}
exports.GuildHandler = GuildHandler;
//# sourceMappingURL=GuildHandler.js.map