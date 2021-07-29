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
const discord_buttons_1 = __importDefault(require("discord-buttons"));
discord_buttons_1.default(exports.client);
const commandHandler = new CommandHandler_1.CommandHandler(`.`);
exports.rawWatchers = [];
let didError = null;
// const privateMessage = require(`./events/privateMessage`)
const kickedFromGuild_1 = __importDefault(require("./events/kickedFromGuild"));
const addedToGuild_1 = __importDefault(require("./events/addedToGuild"));
const otherMemberLeaveServer_1 = __importDefault(require("./events/otherMemberLeaveServer"));
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
// added to a server
exports.client.on(`guildCreate`, addedToGuild_1.default);
// removed from a server
exports.client.on(`guildDelete`, kickedFromGuild_1.default);
// other user leaves a guild
exports.client.on(`guildMemberRemove`, otherMemberLeaveServer_1.default);
exports.client.on(`raw`, async (event) => {
    exports.rawWatchers.forEach((handler) => handler(event));
});
exports.client.on(`ready`, async () => {
    dist_1.default.log(`green`, `Logged in as ${exports.client.user?.tag} in ${(await exports.client.guilds.cache.array()).length} guilds`);
    exports.client.user?.setActivity(`.help`, { type: `LISTENING` });
});
const fs = __importStar(require("fs"));
const discordToken = fs.readFileSync('/run/secrets/discord_token', 'utf-8');
console.log({ discordToken });
exports.client.login(discordToken);
//# sourceMappingURL=index.js.map