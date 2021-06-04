"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InviteCommand = void 0;
const dist_1 = __importDefault(require("../../../../common/dist"));
class InviteCommand {
    constructor() {
        this.commandNames = [`invite`, `inv`, `i`];
    }
    getHelpMessage(commandPrefix) {
        return `Use \`${commandPrefix}${this.commandNames[0]}\` to get a game bot invite link.`;
    }
    async run({ initialMessage, }) {
        await initialMessage.channel.send(`Add ${dist_1.default.GAME_NAME} to your server!\n${dist_1.default.discordBotInviteUrl}`);
    }
    hasPermissionToRun() {
        return true;
    }
}
exports.InviteCommand = InviteCommand;
//# sourceMappingURL=Invite.js.map