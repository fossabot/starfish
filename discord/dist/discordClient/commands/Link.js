"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class LinkCommand {
    commandNames = [`link`, `url`];
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to get a link to your ship's console.`;
    }
    async run({ initialMessage, }) {
        await initialMessage.channel.send(`Your ship's console:\n${dist_1.default.frontendUrl}/s\n\nBot invite link:\n${dist_1.default.discordBotInviteUrl}`);
    }
    hasPermissionToRun(commandContext) {
        if (!commandContext.ship)
            return `Your server doesn't have a ship yet! Run \`${commandContext.commandPrefix}start\` to get started.`;
        return true;
    }
}
exports.LinkCommand = LinkCommand;
//# sourceMappingURL=Link.js.map