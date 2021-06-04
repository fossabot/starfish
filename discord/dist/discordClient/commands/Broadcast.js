"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BroadcastCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const discord_js_1 = require("discord.js");
const ioInterface_1 = __importDefault(require("../../ioInterface"));
class BroadcastCommand {
    constructor() {
        this.commandNames = [];
    }
    getHelpMessage(commandPrefix) {
        return ``;
    }
    async run(context) {
        if (context.ship) {
            const res = await ioInterface_1.default.ship.broadcast(context.ship.id, context.initialMessage.author.id, context.initialMessage.content);
            if (res.error)
                context.sendToGuild(res.error, `broadcast`);
            if (res.data !== undefined)
                context.reactToInitialMessage(dist_1.default.numberToEmoji(res.data));
        }
    }
    ignorePrefixMatchTest(message) {
        if (message.channel instanceof discord_js_1.TextChannel &&
            message.channel.name === `📣comms-bay`)
            return true;
        return false;
    }
    hasPermissionToRun(commandContext) {
        if (commandContext.matchedCommands.length > 1)
            return ``;
        // commandContext.ship.items.find(antenna)
        return true;
    }
}
exports.BroadcastCommand = BroadcastCommand;
//# sourceMappingURL=Broadcast.js.map