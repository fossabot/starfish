"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
/** A user-given command extracted from a message. */
class CommandContext {
    constructor(message, prefix) {
        this.ship = null;
        this.crewMember = null;
        this.commandPrefix = prefix;
        const splitMessage = message.content
            .slice(prefix.length)
            .trim()
            .split(/ +/g);
        this.commandName = splitMessage.shift().toLowerCase();
        this.args = splitMessage;
        this.initialMessage = message;
        this.dm = message.channel.type === 'dm';
        this.gameAdmin = [
            '244651135984467968',
            '395634705120100367',
        ].includes(message.author.id);
    }
}
exports.CommandContext = CommandContext;
//# sourceMappingURL=CommandContext.js.map