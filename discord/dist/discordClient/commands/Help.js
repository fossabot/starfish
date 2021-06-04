"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class HelpCommand {
    constructor(commands) {
        this.commandsToList = [];
        this.commandNames = [`help`, `h`];
        this.commandsToList = [...commands];
        this.commandsToList.push(this);
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to see the game's Discord commands.`;
    }
    async run(context) {
        await context.initialMessage.channel.send(this.commandsToList
            .map((cm) => cm.getHelpMessage(context.commandPrefix))
            .filter((m) => m)
            .join(`\n`) +
            `\n\n` +
            `Your ship's console:\n<${dist_1.default.frontendUrl}/s>\n\nBot invite link:\n<${dist_1.default.discordBotInviteUrl}>`);
    }
    hasPermissionToRun() {
        return true;
    }
}
exports.HelpCommand = HelpCommand;
//# sourceMappingURL=Help.js.map