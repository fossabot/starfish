"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
const discord_js_1 = require("discord.js");
const resolveOrCreateChannel_1 = __importDefault(require("../actions/resolveOrCreateChannel"));
const GameChannel_1 = require("./GameChannel");
const checkPermissions_1 = __importDefault(require("../actions/checkPermissions"));
/** a user-given command extracted from a message. */
class CommandContext {
    /** command name in all lowercase. */
    commandName;
    correctPrefix;
    /** arguments (pre-split by space). */
    args;
    /** arguments not split by space. */
    rawArgs;
    /** original message the command was extracted from. */
    initialMessage;
    author;
    guildMember;
    nickname;
    commandPrefix;
    dm;
    isServerAdmin;
    isGameAdmin;
    guild;
    ship = null;
    crewMember = null;
    isCaptain = false;
    matchedCommands = [];
    channels = {};
    constructor(message, prefix) {
        this.commandPrefix = prefix;
        const splitMessage = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);
        this.correctPrefix =
            message.content.slice(0, prefix.length) === prefix;
        this.commandName = splitMessage.shift().toLowerCase();
        this.args = splitMessage;
        this.rawArgs = splitMessage.join(` `);
        this.initialMessage = message;
        this.author = message.author;
        this.guildMember = message.guild?.members.cache.find((m) => m.user.id === message.author.id);
        this.nickname =
            this.guildMember?.nickname || this.author.username;
        this.guild = message.guild;
        this.dm = message.channel.type === `DM`;
        this.isServerAdmin =
            message.guild?.members.cache
                .find((m) => m.id === message.author.id)
                ?.permissions.has(`BAN_MEMBERS`) || false;
        this.isGameAdmin = [
            `244651135984467968`,
            `395634705120100367`,
        ].includes(message.author.id);
    }
    async sendToGuild(message, channelType = `alert`) {
        let channel = null;
        // try to resolve a channel
        if (this.guild) {
            if (this.channels[channelType])
                channel = this.channels[channelType] || null;
            else {
                // check to see if we have the necessary permissions to create channels
                const sendPermissionsCheck = await (0, checkPermissions_1.default)({
                    requiredPermissions: [`MANAGE_CHANNELS`],
                    guild: this.guild || undefined,
                });
                if (`error` in sendPermissionsCheck) {
                    dist_1.default.log(`Failed to create channel!`, sendPermissionsCheck);
                    return;
                }
                await (0, resolveOrCreateChannel_1.default)({
                    type: channelType,
                    guild: this.guild,
                });
            }
        }
        // otherwise send back to the channel we got the message in in the first place
        if (!channel &&
            !(this.initialMessage.channel instanceof discord_js_1.NewsChannel) &&
            !this.initialMessage.channel.partial &&
            this.initialMessage.channel.type === `GUILD_TEXT`)
            channel = new GameChannel_1.GameChannel(null, this.initialMessage.channel);
        // check to see if we have the necessary permissions to send messages at all
        const sendPermissionsCheck = await (0, checkPermissions_1.default)({
            requiredPermissions: [`SEND_MESSAGES`],
            channel: channel?.channel,
            guild: this.guild || undefined,
        });
        if (`error` in sendPermissionsCheck) {
            dist_1.default.log(`Failed to send!`, sendPermissionsCheck);
            return;
        }
        // send
        if (channel) {
            this.channels[channelType] = channel;
            channel.send(message).catch(dist_1.default.log);
        }
    }
    async reply(message) {
        if (this.initialMessage.channel instanceof discord_js_1.NewsChannel ||
            this.initialMessage.channel.partial ||
            this.initialMessage.channel.type !== `GUILD_TEXT`)
            return;
        let channel = new GameChannel_1.GameChannel(null, this.initialMessage.channel);
        // check to see if we have the necessary permissions to send messages at all
        const sendPermissionsCheck = await (0, checkPermissions_1.default)({
            requiredPermissions: [`SEND_MESSAGES`],
            channel: channel?.channel,
            guild: this.guild || undefined,
        });
        if (`error` in sendPermissionsCheck) {
            dist_1.default.log(`Failed to send!`, sendPermissionsCheck);
            return;
        }
        // send
        if (channel) {
            channel.send(message).catch(dist_1.default.log);
        }
    }
    async reactToInitialMessage(emoji) {
        await this.initialMessage.react(emoji).catch(dist_1.default.log);
    }
}
exports.CommandContext = CommandContext;
//# sourceMappingURL=CommandContext.js.map