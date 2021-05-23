"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
const discord_js_1 = require("discord.js");
const resolveOrCreateChannel_1 = __importDefault(require("../actions/resolveOrCreateChannel"));
const GameChannel_1 = require("./GameChannel");
/** a user-given command extracted from a message. */
class CommandContext {
    constructor(message, prefix) {
        this.ship = null;
        this.crewMember = null;
        this.isCaptain = false;
        this.channels = {};
        this.commandPrefix = prefix;
        const splitMessage = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);
        this.commandName = splitMessage.shift().toLowerCase();
        this.args = splitMessage;
        this.initialMessage = message;
        this.guild = message.guild;
        this.dm = message.channel.type === `dm`;
        this.isGameAdmin = [
            `244651135984467968`,
            `395634705120100367`,
        ].includes(message.author.id);
    }
    async sendToGuild(message, channelType = `alert`) {
        let channel = null;
        // try to resolve a channel
        if (this.guild) {
            channel =
                this.channels[channelType] ||
                    (await resolveOrCreateChannel_1.default({
                        type: channelType,
                        guild: this.guild,
                    }));
        }
        // otherwise send back to the channel we got the message in in the first place
        if (!channel &&
            !(this.initialMessage.channel instanceof discord_js_1.NewsChannel))
            channel = new GameChannel_1.GameChannel(null, this.initialMessage.channel);
        // send
        if (channel) {
            this.channels[channelType] = channel;
            channel.send(message);
        }
    }
}
exports.CommandContext = CommandContext;
//# sourceMappingURL=CommandContext.js.map