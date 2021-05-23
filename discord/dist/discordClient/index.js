"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connected = exports.rawWatchers = exports.client = void 0;
const dist_1 = __importDefault(require("../../../common/dist"));
const Discord = __importStar(require("discord.js"));
const CommandHandler_1 = require("./CommandHandler");
exports.client = new Discord.Client({
    restTimeOffset: 0,
    messageCacheMaxSize: 2,
    messageCacheLifetime: 30,
    messageSweepInterval: 60,
});
const commandHandler = new CommandHandler_1.CommandHandler(`.`);
exports.rawWatchers = [];
let didError = null;
// const privateMessage = require(`./events/privateMessage`)
// const kickedFromGuild = require(`./events/kickedFromGuild`)
// const addedToGuild = require(`./events/addedToGuild`)
// // added to a server
// client.on(`guildCreate`, addedToGuild)
// // removed from a server
// client.on(`guildDelete`, kickedFromGuild)
// // other user leaves a guild
// client.on(`guildMemberRemove`, otherMemberLeaveServer)
async function connected() {
    return new Promise(async (resolve, reject) => {
        if (didError)
            resolve(false);
        if (exports.client.readyAt) {
            resolve(true);
            return;
        }
        let timeout = 0;
        while (timeout < 200) {
            // 20 seconds
            await dist_1.default.sleep(100);
            if (didError)
                resolve(false);
            if (exports.client.readyAt) {
                resolve(true);
                return;
            }
            timeout++;
        }
        resolve(false);
    });
}
exports.connected = connected;
exports.client.on(`error`, (e) => {
    dist_1.default.log(`red`, `Discord.js error:`, e.message);
    didError = e.message;
});
exports.client.on(`message`, async (msg) => {
    if (!msg.author || msg.author.bot)
        return;
    commandHandler.handleMessage(msg);
});
exports.client.on(`raw`, async (event) => {
    exports.rawWatchers.forEach((handler) => handler(event));
});
exports.client.on(`ready`, async () => {
    dist_1.default.log(`green`, `Logged in as ${exports.client.user?.tag} in ${(await exports.client.guilds.cache.array()).length} guilds`);
    exports.client.user?.setActivity(`.help`, { type: `LISTENING` });
});
exports.client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map